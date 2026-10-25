import json, urllib.request

def get(url, headers=None):
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers or {}), timeout=40) as r:
        return json.loads(r.read()), dict(r.headers)

repos = {'gitleaks':'gitleaks/gitleaks', 'trivy':'aquasecurity/trivy', 'conftest':'open-policy-agent/conftest', 'semgrep':'semgrep/semgrep'}
versions={}
for key, repo in repos.items():
    data,_=get('https://api.github.com/repos/'+repo+'/releases/latest')
    versions[key]=data['tag_name']
images={'node':('library/node','24.22.1-alpine'), 'gitleaks':('zricethezav/gitleaks', versions['gitleaks']), 'trivy':('aquasec/trivy',versions['trivy'].lstrip('v')), 'conftest':('openpolicyagent/conftest',versions['conftest']), 'semgrep':('semgrep/semgrep',versions['semgrep'].lstrip('v'))}
pins={}
for key,(repo,tag) in images.items():
    try:
        token,_=get('https://auth.docker.io/token?service=registry.docker.io&scope=repository:'+repo+':pull')
        _,headers=get('https://registry-1.docker.io/v2/'+repo+'/manifests/'+tag, {'Authorization':'Bearer '+token['token'],'Accept':'application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json'})
        digest=next(v for k,v in headers.items() if k.lower()=='docker-content-digest')
        pins[key]={'image':repo.removeprefix('library/')+':'+tag+'@'+digest,'version':tag}
    except Exception as e: pins[key]={'error':str(e),'repo':repo,'tag':tag}
if any('error' in pin for pin in pins.values()):
    raise SystemExit(json.dumps(pins,indent=2))
print(json.dumps(pins,indent=2))
open('tool-pins.json','w').write(json.dumps(pins,indent=2)+'\n')
