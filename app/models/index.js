const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.user = require("./digital_approval/master/user.model");
db.role = require("./digital_approval/master/role.model");
db.form = require("./digital_approval/master/form.model");
db.company = require("./digital_approval/master/company.model");
db.division = require("./digital_approval/master/division.model");
db.department = require("./digital_approval/master/department.model");
db.level_user = require("./digital_approval/master/level.user.model");
db.application = require("./form/service_request/mapplication.model");
db.form_approval = require("./digital_approval/master/form.approval.model");
db.access_permission = require("./digital_approval/master/access.permissions.model");
db.approval_header = require("./digital_approval/transaction/approval.header.model");
db.approval_detail = require("./digital_approval/transaction/approval.detail.model");

// comments
db.comment = require("./comments/comments.model")

// Timesheet
db.timesheet_header = require("./form/timesheet/timesheet.hdr.model");
db.timesheet_detail = require("./form/timesheet/timesheet.dtl.model");

// IT Billing Telkomsel
db.it_billing_telkomsel_hdr = require("./billing_telkomsel/billing.telkomsel.hdr.model");
db.it_billing_telkomsel_dtl = require("./billing_telkomsel/billing.telkomsel.dtl.model");
db.it_billing_telkomsel_mst = require("./billing_telkomsel/billing.telkomsel.mst.model");

// Service Request 
db.it_service_request = require("./form/service_request/service.request.model");

//Travel Authority
db.ta = require('./form/travel_authority/t_ta_hdr.model');
db.user_ta = require('./form/travel_authority/t_ta_user_dtl.model');
db.reservation = require('./form/travel_authority/t_ta_rsv_dst_dtl.model');
db.accomodation = require('./form/travel_authority/t_ta_rsv_hotel_dtl.model');
db.user_cost_est_ta = require('./form/travel_authority/t_ta_cost_est_dtl.model');

// HIAS
db.hias = require('./form/hias/t_hias.model');
db.hias_attachment = require('./form/hias/m_hias_attachment.model');

// Working Permit   
db.validation_permit = require('./form/working_permit/validation_permit.model');
db.resposibility_area = require('./form/working_permit/responsible_location.model');
db.permit_item = require('./form/working_permit/item_permit.model');
db.permit = require('./form/working_permit/working_permit.model');
db.apd = require('./form/working_permit/item_apd.model');

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;

