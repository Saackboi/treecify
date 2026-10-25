"""Build a read-only HTML viewer of real logs. Screenshots are captured separately."""
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone, timedelta
import hashlib
import html
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'evidencias'
VIEW = EVIDENCE / 'visor'
VIEW.mkdir(parents=True, exist_ok=True)
(VIEW / 'raw').mkdir(exist_ok=True)
PAGES = []
ANSI = re.compile(r'\x1b\[[0-9;]*[a-zA-Z]')
STYLE = '''body{margin:0;background:#f3f6fb;color:#18263a;font:16px/1.55 system-ui,sans-serif}
main{max-width:1100px;margin:auto;padding:24px}h1{font-size:25px;line-height:1.25;margin:12px 0}
h2{font-size:17px;margin-top:24px}small,.note{color:#465a73}header{border-bottom:3px solid #147d79;padding-bottom:14px}
.tag{font-size:12px;font-weight:700;color:#147d79;letter-spacing:1px}pre{background:#101c2c;color:#ecf4ff;padding:17px;
white-space:pre-wrap;overflow-wrap:anywhere;border-radius:8px;font:13px/1.55 Consolas,monospace}
a{color:#086d88}li{margin:12px 0}.source{font-size:12px;margin-top:4px}img{max-width:100%;border:1px solid #ccd4df}
footer{margin-top:25px;font-size:12px;color:#52647a}table{border-collapse:collapse;width:100%}td,th{padding:8px;border:1px solid #cdd7e5;text-align:left}'''


def read(name):
    return (ROOT / name).read_text(encoding='utf-8-sig', errors='replace')


def data(name):
    return json.loads(read(name))


def section(name, text=None, limit=65):
    path = ROOT / name
    if not path.exists():
        return ''
    raw = read(name)
    safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', name)
    shutil.copyfile(path, VIEW / 'raw' / safe_name)
    value = ANSI.sub('', text if text is not None else raw)
    lines = value.splitlines()
    if len(lines) > limit:
        value = '\n'.join(lines[:limit // 2] + ['[Extracto: líneas intermedias omitidas; original enlazado abajo]'] + lines[-limit // 2:])
    return '<h2>' + html.escape(name) + '</h2><pre>' + html.escape(value.strip()) + '</pre><p class="source">Original: <a href="raw/' + safe_name + '">' + html.escape(name) + '</a> · SHA-256 ' + hashlib.sha256(path.read_bytes()).hexdigest()[:20] + '…</p>'


def page(key, title, sections, note, environment='Laboratorio · datos ficticios'):
    body = ''.join(sections)
    value = '<!doctype html><html lang="es"><meta charset="utf-8"><title>' + html.escape(title) + '</title><style>' + STYLE + '</style><main><header><div class="tag">LAB-TE2-03 · EVIDENCIA ' + key + '</div><h1>' + html.escape(title) + '</h1><div>' + html.escape(environment) + '</div></header><p class="note">' + html.escape(note) + '</p>' + body + '<footer>Visor de salidas reales. No simula una terminal ni la interfaz de GitHub. Los extractos conservan enlaces y hash del archivo original. Generado ' + datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=-5))).strftime('%Y-%m-%d %H:%M UTC-05 (America/Bogota)') + '.</footer></main></html>'
    (VIEW / (key + '.html')).write_text(value, encoding='utf-8')
    PAGES.append({'slug': key, 'title': title, 'environment': environment, 'note': note})


tests = read('evidencias/local/tests-final.log')
page('10-pruebas', 'Pruebas de seguridad de la aplicación', [section('evidencias/local/tests-final.log', '\n'.join(x for x in tests.splitlines() if x.startswith(('✔', 'ℹ', '✖')))), section('evidencias/local/lint-final.log')], 'Resultados reales de Node; los registros HTTP completos permanecen en el original.')
page('11-docker-controles', 'Docker: identidad y restricciones', [section('evidencias/docker/version.txt'), section('evidencias/docker/identity.txt'), section('evidencias/docker/inspect.json')], 'Docker Engine dentro de la máquina WSL de laboratorio. Se inspeccionan solo campos seguros; no se guarda Config.Env.')
page('12-docker-http', 'Docker: health, autenticación y métricas', [section('evidencias/docker/smoke.txt')], 'La prueba imprime estados y resumen, nunca el JWT ni la contraseña ficticia.')
page('13-podman-controles', 'Podman rootless: identidad y límites observados', [section('evidencias/podman/version.txt'), section('evidencias/podman/identity.txt'), section('evidencias/podman/inspect.json'), section('evidencias/podman/runtime-limitations.txt')], 'WSL no delega cgroups: esta comparación conserva readonly, usuario no root y descarte de capacidades, pero no aplica límites CPU/memoria. Docker y CI mantienen los controles completos.')
page('14-podman-http', 'Podman: health, autenticación y métricas', [section('evidencias/podman/smoke.txt')], 'Puerto local 3002 para evitar conflicto con Docker. Mismo Dockerfile; formato Docker para conservar HEALTHCHECK.')
page('15-compose', 'Compose: volumen nuevo y contenedor saludable', [section('evidencias/compose/version.txt'), section('evidencias/compose/up.txt'), section('evidencias/compose/ps.json'), section('evidencias/compose/smoke.txt', limit=25)], 'Volumen treecify-lab_lab-data creado para datos ficticios. El contenedor se detuvo al terminar; el volumen se conserva.')
page('16-secretos', 'Gitleaks: árbol e historial de laboratorio sin fugas', [section('evidencias/local/current-secrets.json'), section('evidencias/local/lab-history-clean.json'), section('.env.example')], 'Los reportes vacíos significan cero hallazgos. El historial de HEAD se saneó sin allowlist; main y etiquetas originales permanecen intactos y requieren coordinación si aquella clave se usó.')
page('17-politicas', 'Políticas: violación detectada y archivos corregidos', [section('evidencias/local/docker-negative.txt'), section('evidencias/local/k8s-negative.txt'), section('evidencias/local/docker-corrected.txt'), section('evidencias/local/k8s-corrected.txt'), section('evidencias/local/docker-unit.txt'), section('evidencias/local/k8s-unit.txt')], 'Exit 1 era el resultado esperado de cada fixture negativo. Los manifiestos reales pasan y existen 13 pruebas unitarias Rego.')
for case, label in [('secret', 'Credencial deliberadamente falsa'), ('policy', 'Regla propia de ServiceAccount'), ('sast', 'CORS abierto detectado por Semgrep')]:
    name = 'evidencias/actions/' + case + '-red.log'
    text = read(name)
    if case == 'secret':
        lines = [x for x in text.splitlines() if any(t in x for t in ['Finding:', 'RuleID:', 'File:', 'leaks found', 'exit code 1', 'treecify-lab-canary'])]
    elif case == 'policy':
        lines = [x for x in text.splitlines() if any(t in x for t in ['FAIL -', 'ServiceAccount', 'failures', 'exit code 1'])]
    else:
        lines = [x for x in text.splitlines() if any(t in x for t in ['treecify-no-open-cors', 'Orígenes', 'orígenes', 'insecureLab', 'cors()', 'Code Finding', 'Findings:', 'exit code 1'])]
    page('18-rojo-' + case, label + ': fallo real en Actions', [section(name, '\n'.join(lines))], 'Extracto del log original de GitHub Actions. La corrección se comprobó en otra ejecución, sin desactivar el control.', 'Runner Linux · GitHub Actions')
summary = data('evidencias/ci-verde/sbom-summary.json')
analysis = {}
for name in ['image-scan.json', 'sbom-scan.json']:
    report = data('evidencias/ci-verde/' + name)
    analysis[name] = {'HIGH_CRITICAL': sum(len(x.get('Vulnerabilities', [])) for x in report.get('Results', [])), 'targets': [x['Target'] for x in report.get('Results', [])]}
page('19-sbom', 'SBOM de imagen y análisis de vulnerabilidades', [section('evidencias/ci-verde/sbom-summary.json'), section('evidencias/ci-verde/image-scan.json', json.dumps(analysis, indent=2, ensure_ascii=False)), section('evidencias/ci-verde/artifact-source.json')], 'Resumen calculado de los reportes originales: inventario CycloneDX de la imagen, no solo del lockfile. El umbral HIGH/CRITICAL da cero; los avisos moderados de desarrollo se documentan aparte.', 'Runner Linux · GitHub Actions')
run = data('evidencias/k8s-ci/artifact-source.json')['run']
environment = 'Clúster kind efímero · runner Linux · Actions ' + str(run)
folders = sorted(p for p in (EVIDENCE / 'k8s-ci').iterdir() if p.is_dir())
folder = folders[-1]
rel = folder.relative_to(ROOT).as_posix() + '/'
page('20-k8s-despliegue', 'Kubernetes: creación y despliegue', [section('evidencias/k8s-ci/setup.txt', limit=48), section(rel + 'initial-pods.txt')], 'Secret generado fuera del repositorio; no se muestran sus valores. La prueba se ejecutó en Linux del runner, no en el WSL afectado por cgroups.', environment)
deployment = data('evidencias/k8s-ci/deployment-controls.json')
pod = deployment['spec']['template']['spec']
controls = {'replicas': deployment['spec']['replicas'], 'automountServiceAccountToken': pod['automountServiceAccountToken'], 'pod_securityContext': pod['securityContext'], 'container': {k: pod['containers'][0].get(k) for k in ['image', 'imagePullPolicy', 'securityContext', 'resources', 'readinessProbe', 'livenessProbe', 'volumeMounts']}}
page('21-k8s-seguridad', 'Kubernetes: controles aplicados', [section('evidencias/k8s-ci/deployment-controls.json', json.dumps(controls, indent=2, ensure_ascii=False), limit=90)], 'Extracto del Deployment devuelto por Kubernetes: UID 10001, raíz readonly, capacidades descartadas, probes, recursos y volúmenes de laboratorio.', environment)
page('22-k8s-pod', 'Resiliencia: pod eliminado y reemplazado', [section(rel + 'initial-pods.txt'), section(rel + 'deleted-pod.txt'), section(rel + 'recovered-rollout.txt'), section(rel + 'recovered-pods.txt'), section(rel + 'timeline.txt')], 'Comparar los nombres antes/después. La línea temporal mide el intervalo observado, no una garantía general de recuperación.', environment)
page('23-k8s-rollback', 'Imagen inexistente: bloqueo y rollback', [section(rel + 'bad-update.txt'), section(rel + 'bad-rollout.txt'), section(rel + 'bad-pods.txt'), section(rel + 'rollback.txt')], 'El timeout de 30 s es intencionado. imagePullPolicy Never produce ErrImageNeverPull en la imagen inexistente; el rollout undo vuelve a la imagen precargada.', environment)
distribution = Counter(json.loads(line)['instancia'] for line in read(rel + 'distribution.jsonl').splitlines() if line.strip())
page('24-k8s-escala', 'Escala: dos → cinco → dos réplicas', [section(rel + 'scale-five.txt'), section(rel + 'restored-pods.txt'), section(rel + 'distribution.jsonl', json.dumps({'solicitudes_muestreadas': sum(distribution.values()), 'reparto_observado': distribution}, indent=2, ensure_ascii=False))], 'El muestreo no garantiza visitar todos los pods. Los contadores se verifican por réplica. SQLite y avatares siguen siendo estado independiente y efímero por pod.', environment)
logs = []
for p in sorted(folder.glob('*-logs.jsonl')):
    values = read(p.relative_to(ROOT).as_posix()).splitlines()
    selected = [x for x in values if 'acceso no autorizado' in x]
    for line in values:
        json.loads(line)
    logs.append(section(p.relative_to(ROOT).as_posix(), '\n'.join(selected[-2:])))
page('25-k8s-logs', 'Eventos 401 provocados en las cinco réplicas', logs, 'Se validó que las líneas son JSON. Los eventos incluyen instancia y estado; omiten credenciales y cuerpos.', environment)
metrics = []
for p in sorted(folder.glob('*-metrics.txt')):
    metrics.append(section(p.relative_to(ROOT).as_posix(), '\n'.join(x for x in read(p.relative_to(ROOT).as_posix()).splitlines() if 'codigo="401"' in x or 'TYPE' in x)))
page('26-k8s-metricas', 'Métricas separadas de las cinco réplicas', metrics, 'Cada pod mantiene su propio contador. Aquí se consultó cada target directamente; no se interpreta la respuesta del Service como total agregado.', environment)
page('27-k8s-trafico', 'Tráfico observado durante las fallas', [section(rel + 'traffic-summary.json'), section(rel + 'timeline.txt'), section(rel + 'traffic.txt', limit=16)], 'Conteos obtenidos de solicitudes reales durante eliminación de pod y actualización defectuosa; son resultados de esta ejecución, no una promesa de disponibilidad.', environment)
workflow = read('.github/workflows/devsecops.yml')
pins = '\n'.join(x for x in workflow.splitlines() if 'uses:' in x or 'contents: read' in x or 'sha256sum' in x)
page('28-suministro', 'Referencias verificables y Dependabot', [section('tool-pins.json'), section('.github/dependabot.yml'), section('.github/workflows/devsecops.yml', pins)], 'Acciones con SHA completo, imágenes por digest, kind verificado por SHA-256 y espera de siete días para actualizaciones.')
failure = read('evidencias/k8s-create.txt')
page('29-limite-wsl', 'Límite real del equipo Windows y alternativa comprobada', [section('evidencias/k8s-create.txt', '\n'.join(x for x in failure.splitlines() if 'failed' in x.lower() or 'not healthy' in x.lower())[:8000], limit=18), section('evidencias/podman/runtime-limitations.txt')], 'La creación kind local falló por el entorno WSL. Las pruebas Kubernetes completas y con límites se ejecutaron en el runner Linux. No se presentan como ejecutadas en este equipo.')
links = ''.join('<li><a href="' + p['slug'] + '.html">' + p['slug'] + ' · ' + html.escape(p['title']) + '</a><br><small>' + html.escape(p['environment']) + '</small></li>' for p in PAGES)
(VIEW / 'index.html').write_text('<!doctype html><meta charset="utf-8"><title>Evidencias Treecify</title><style>' + STYLE + '</style><main><header><div class="tag">LAB-TE2-03</div><h1>Índice de evidencias y capturas</h1></header><p>Visor de salidas originales. Las capturas del navegador se guardan en la carpeta capturas y se distinguen de estas páginas de logs.</p><ol>' + links + '</ol></main>', encoding='utf-8')
(VIEW / 'manifest.json').write_text(json.dumps(PAGES, indent=2, ensure_ascii=False), encoding='utf-8')
print(f'{len(PAGES)} páginas de evidencia generadas en {VIEW}')
