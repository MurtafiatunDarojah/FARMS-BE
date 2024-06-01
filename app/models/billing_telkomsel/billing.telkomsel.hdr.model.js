const mongoose = require("mongoose");

mongoose.pluralize(null);

const schema = new mongoose.Schema(
  {
    approval_process_id:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tapproval_hdr",
    },
    form_record: {
      type: String,
      default: null
    },
    pdf_file: {
      type: String,
      default: null
    },
    periode_upload: {
      type: String,
      required: true
    },
    last_active: { type: Boolean, default: false },
    invoice_year: { type: String, required: true },
    invoice_month: { type: String, required: true },
    billcycle: { type: String, required: true },
    payment_period: { type: String, required: true },
    custid: { type: String, required: true },
    kartuhalo_number: { type: String, required: true },
    account_number: { type: String },
    name: { type: String },
    company: { type: String },
    address_line_1: { type: String },
    city: { type: String },
    invoice_number: { type: String },
    fakturdate: { type: String },
    due_date: { type: String },
    customer_group: { type: String },
    previous_balance: { type: Number },
    payment: { type: Number },
    adjustment_usage: { type: Number },
    adjustment_tax: { type: Number },
    balance_due: { type: Number },
    subscription_fee: { type: Number },
    calls_to_telkomsel_numbers: { type: Number },
    calls_to_other_operators: { type: Number },
    idd_international_sms: { type: Number },
    domestic_sms: { type: Number },
    international_roaming: { type: Number },
    prepaid_recharge: { type: Number },
    group_service: { type: Number },
    shared_pool_data: { type: Number },
    domestic_data: { type: Number },
    data_package: { type: Number },
    data_usage: { type: Number },
    data_package_penalty: { type: Number },
    voice_sms_and_bundling_package: { type: Number },
    bundling_package: { type: Number },
    device_bundling_service: { type: Number },
    bundling_penalty: { type: Number },
    international_services: { type: Number },
    digital_services: { type: Number },
    digital_bussines_solution: { type: Number },
    others: { type: Number },
    detailed_call_record: { type: Number },
    delivery_charge: { type: Number },
    variance_to_minimum_usage_guarantee: { type: Number },
    discount: { type: Number },
    sub_total_of_non_taxable_charge: { type: Number },
    sub_total_of_taxable_charge: { type: Number },
    vat_11: { type: Number },
    stamp_duty_for_last_payment: { type: Number },
    current_balance: { type: Number },
    amount_due_to_be_paid: { type: Number },
    said: { type: String },
    previous_point_balane: { type: String },
    current_month_eamed_points: { type: String },
    bonus_points: { type: String },
    redeemed_points: { type: String },
    total_points_will_expire: { type: String },
    total_points: { type: String },
    updated_by: { type: String },
    created_by: { type: String },
  },
  {
    timestamps: { createdAt: "created_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
)

schema.virtual("unit", {
  ref: 'mbil_tsel',
  localField: "kartuhalo_number",
  foreignField: "telp",
  justOne: true
})


const ITBillingTelkomselHdr = mongoose.model(
  "tbil_tsel_hdr",
  schema
);

module.exports = ITBillingTelkomselHdr;