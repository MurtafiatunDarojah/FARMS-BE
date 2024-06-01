const { user, access_permission } = require("../../models");

exports.roles_admin = async (req, res) => {
  try {
    const foundUser = await user
    .findOne({ email: req.body.email })
    .populate("roles", "-__v")
    .populate("department", "fullname code")
    .populate("company", "fullname code business_entity");
    
    if (!foundUser) {
      return res.status(404).send({ message: "User Not found." });
    }

    let authorities = [];

    for (let i = 0; i < foundUser.roles.length; i++) {
      if (foundUser.roles[i].name.toUpperCase() !== "ADMIN") {
        return res.status(403).send({
          accessToken: null,
          message: "Need Admin Roles.",
        });
      }
      authorities.push("ROLE_" + foundUser.roles[i].name.toUpperCase());
    }
    
    let getPermissions = []
    
    let Permissions = await access_permission.find({ user_nik: foundUser.nik, role: "admin", active: true })
    .select('role _id user_nik menu permission active')
    .populate('mform')
    
      Permissions.forEach(element => {

        getPermissions.push(
          {
            menu: element.mform.name,
            code: element.mform.code,
            permission: element.permission,
          }
        )

      });
    
    res.status(200).send({
      id: foundUser._id,
      nik: foundUser.nik,
      fullname: foundUser.fullname,
      email: foundUser.email,
      roles: authorities,
      access_permission: getPermissions,
      company: foundUser.company,
      department: foundUser.department,
      accessToken: req.headers["x-access-token"],
    });
    
  } catch (err) {
    res.status(500).send({ message: err });
  }
};
