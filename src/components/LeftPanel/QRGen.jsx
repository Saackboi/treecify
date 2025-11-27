import QRCode from "react-qr-code"

export default function QRGen({ url, idSuffix = "main" }) {


    const uniqueId = `qr-code-svg-${idSuffix}`

    const downloadQR = () => {

        //Truco para descargar el SVG como imagen
        const svg = document.getElementById(uniqueId)
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const pngFile = canvas.toDataURL("image/png")

            const downloadLink = document.createElement("a")
            downloadLink.download = `qr-${idSuffix}.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col items-center text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tu Código QR</h3>

            {/* Código QR Visible */}
            <div className="p-4 bg-white border-4 border-slate-900 rounded-xl shadow-lg mb-4">
                <QRCode
                    id={uniqueId}
                    value={url}
                    size={150}
                    fgColor="#1e293b"
                />
            </div>

            <p className="text-xs text-slate-500 mb-4 break-all px-4">
                Apunta a: <span className="font-mono text-indigo-600">{url}</span>
            </p>

            {/* Botón de descarga */}
            <button
                onClick={downloadQR}
                className="text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                title="Funcionalidad de descarga simple (Prueba)"
            >
                Descargar QR
            </button>
        </div>
    )
}
