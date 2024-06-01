require('dotenv').config()

const getWhatsAppLink = (companyCode) => {
    
    // Objek pemetaan kode perusahaan ke tautan WhatsApp
    let linkMappings = {
        "BRM": "https://farms-staging.brmapps.com/",
        "CPM": "https://farms-staging.citrapalu.net/",
        "GMI": "https://farms-staging.gorontalominerals.com/",
        "SHS": "https://farms-staging.shsinergi.com/",
        "LMR": "https://farms-staging.lmrcs.com/"
    };

    // Mendapatkan nilai environment dari .env
    const environment = process.env.ENV || 'development'; // Nilai default adalah 'development' jika NODE_ENV tidak ada di .env

    // Periksa apakah kita berada di environment produksi
    const isProduction = environment === 'production';
    // Periksa apakah kode perusahaan valid
    if (linkMappings.hasOwnProperty(companyCode)) {
        // Jika berada di environment produksi, gunakan tautan produksi
        if (isProduction) {
            return linkMappings[companyCode].replace("-staging", "");
        } else {
            return linkMappings[companyCode];
        }
    } else {
        // Jika kode perusahaan tidak valid, kembalikan tautan produksi jika di environment produksi
        if (isProduction) {
            return linkMappings["BRM"].replace("-staging", "");
        } else {
            return linkMappings["BRM"];
        }
    }
}

module.exports = {
    getWhatsAppLink
};
