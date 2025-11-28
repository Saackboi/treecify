//UTIL PARA TENER ALERTAS PERSONALIZADAS PREFABRICADAS

import Swal from "sweetalert2";

const mySwal = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        confirmButton: 'bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition mx-1',
        cancelButton: 'bg-slate-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-600 focus:ring-4 focus:ring-slate-300 transition mx-1',
        popup: 'rounded-2xl shadow-xl'
    }
})

export default mySwal;