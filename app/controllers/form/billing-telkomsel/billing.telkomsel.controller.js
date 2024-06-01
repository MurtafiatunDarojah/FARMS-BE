const ITBillingTelkomHDR = require("../../../models/billing_telkomsel/billing.telkomsel.hdr.model")

exports.billingTelkomselDetail = async (req, res) => {

    try {
        let totalGroupByBE = []
        let groupBESort = []
        let dataClean = []
        let dataGroup = []
        let subtotal = 0
        let totalBE = 0

        // Checking Duplicated Periode & Get Process Approval
        let bilHeader = await ITBillingTelkomHDR.find({ last_active: false, form_record: req.query.id })
            .populate({
                path: 'approval_process_id',
                populate: [
                    {
                        path: 'detail',
                        populate: {
                            path: 'approved_by',
                        },
                    },
                    {
                        path: 'uid',
                    },
                ]
            })
            .populate('unit')
            .exec()

        if (bilHeader.length == 0) {
            return res.status(404).send({ code: 404, status: "NOT_FOUND", error: "imported periode " + req.query.id + " not Found" })
        }



        bilHeader.forEach((item) => {
            //if unit not found, back to default BRM 
            let business_entity = item.unit ? item.unit.business_entity : "BRM";

            let SUM = Number(item.amount_due_to_be_paid < 0 ? 0 : item.amount_due_to_be_paid)

            let DTO = {
                seq: item.unit ? item.unit.seq : item.kartuhalo_number.substring(),
                provider: item.unit ? item.unit.provider : 'Tsel',
                invoice_number: item.invoice_number,
                name: item.unit ? item.name : item.name,
                telp: item.unit ? item.unit.telp : item.kartuhalo_number,
                international_roaming: item.international_roaming,
                calls_to_telkomsel_numbers: item.calls_to_telkomsel_numbers,
                calls_to_other_operators: item.calls_to_other_operators,
                idd_international_sms: item.idd_international_sms,
                domestic_sms: item.domestic_sms,
                domestic_data: item.domestic_data,
                amount_due_to_be_paid: SUM,
                business_entity: business_entity,
                subtotal_bu: null,
                remarks: item.unit ? item.unit.remarks : ''
            }

            dataClean.push(DTO)
            subtotal += SUM

        })

        dataClean.sort((a, b) => {
            const nameA = a.business_entity.toUpperCase();
            const nameB = b.business_entity.toUpperCase();

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        })

        // Count Based on BE
        dataClean.forEach((data, index) => {

            dataGroup.push(data)

            totalBE += data.amount_due_to_be_paid

            let be_compare = dataClean[index + 1] ? dataClean[index + 1].business_entity : null;

            if (data.business_entity != be_compare) {

                totalGroupByBE.push({
                    be: data.business_entity,
                    total: totalBE,
                })

                dataGroup.push({
                    seq: null,
                    provider: null,
                    invoice_number: null,
                    name: null,
                    telp: null,
                    international_roaming: null,
                    calls_to_telkomsel_numbers: null,
                    calls_to_other_operators: null,
                    idd_international_sms: null,
                    domestic_sms: null,
                    domestic_data: null,
                    amount_due_to_be_paid: null,
                    business_entity: data.business_entity,
                    subtotal_bu: totalBE,
                    remarks: null
                })

                // Sort by Name based on BE
                groupBESort.push({
                    data: dataGroup.sort((a, b) => {
                        const nameA = a.name ? a.name.toUpperCase() : 'Z';
                        const nameB = b.name ? b.name.toUpperCase() : 'Z';

                        if (nameA < nameB) {
                            return -1;
                        }

                        if (nameA > nameB) {
                            return 1;
                        }

                        // names must be equal
                        return 0;
                    }),
                })
                // Reset Data Group after get based on BE
                dataGroup = []

                totalBE = 0
            }

        })

        // Get Result Sort name based on BE
        groupBESort.forEach(item => {
            item.data.forEach(item => {
                dataGroup.push(item)
            })
        })

        return res.status(200).send({ code: 200, status: "OK", data: { recap: { subTotal: subtotal, total_be: totalGroupByBE }, billing: dataGroup, process: bilHeader[0].approval_process_id || null, pdf_file: bilHeader[0].pdf_file} });

    } catch (error) {
        return res.status(500).send({ code: 500, status: "INTERNAL_SERVER_ERROR", error: [{ name: error.toString() }] });
    }
}
