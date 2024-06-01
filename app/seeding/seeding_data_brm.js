const bcrypt = require("bcryptjs/dist/bcrypt");

const FormApproval = require("../models/digital_approval/master/form.approval.model");
const Application = require("../models/digital_approval/master/mapplication.model");
const department = require("../models/digital_approval/master/department.model");
const LevelUser = require("../models/digital_approval/master/level.user.model");
const division = require("../models/digital_approval/master/division.model");
const Company = require("../models/digital_approval/master/company.model");
const Form = require("../models/digital_approval/master/form.model");
const Role = require("../models/digital_approval/master/role.model");
const User = require("../models/digital_approval/master/user.model");

const ITBillingTelkomHDR = require("../models/billing_telkomsel/billing.telkomsel.hdr.model");
const ITBillingTelkomDTL = require("../models/billing_telkomsel/billing.telkomsel.dtl.model");
const ITBillingTelkomMST = require("../models/billing_telkomsel/billing.telkomsel.mst.model");

let XLSX = require('xlsx');
const { mongoose } = require("../models");

const role_define = () => {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        _id: mongoose.Types.ObjectId('62b97ff0a39330b31b03edf0'),
        name: "user",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });
      new Role({
        _id: mongoose.Types.ObjectId('62b97ff0a39330b31b03edf1'),
        name: "moderator",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'moderator' to roles collection");
      });
      new Role({
        _id: mongoose.Types.ObjectId('62f84b82493ea74c934295a0'),
        name: "admin",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'admin' to roles collection");
      });
    }
  });
};

const application_define = () => {
  Application.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Application({
        app_id: "APP01",
        name: "Epicor",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Epicor' to Application collection");
      });

      new Application({
        app_id: "APP02",
        name: "Micromine",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Micromine' to Application collection");
      });

      new Application({
        app_id: "APP03",
        name: "Arcgis",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Arcgis' to Application collection");
      });

      new Application({
        app_id: "APP04",
        name: "Safe Pedia",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Safe Pedia' to Application collection");
      });

      new Application({
        app_id: "APP05",
        name: "Global Mapper",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Global Mapper' to Application collection");
      });

      new Application({
        app_id: "APP06",
        name: "Rocksicne",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Rocksicne' to Application collection");
      });
    }
  });
};

const department_define = () => {
  department.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new department({
        _id: mongoose.Types.ObjectId('62f6199bacabf5050a7ef02f'),
        company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        fullname: "Human Resource",
        code: "HRGA",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'HRD' to department collection");
      });
      new department({
        _id: mongoose.Types.ObjectId('62f34a161fb6b5cde7531ebf'),
        company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        fullname: "Information Technology",
        code: "IT",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'IT' to department collection");
      });
      new department({
        _id: mongoose.Types.ObjectId('62f34a29da5eb6e5d7c1d90c'),
        company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        fullname: "HSE & Technical Compliance",
        code: "HSE",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'HSE' to department collection");
      });

      new department({
        _id: mongoose.Types.ObjectId('62f87e42d838165ac123bc88'),
        company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        fullname: "Accounting",
        code: "accounting",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Accounting' to department collection");
      });
    }
  });

  new department({
    _id: mongoose.Types.ObjectId('62f87f30151f6d16ee7f2693'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Business Analyst & Budget Control",
    code: "business analyst & budget control",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Business Analyst & Budget Control' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f87f8ed1103e7e860609fd'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Civil",
    code: "civil",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Civil' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f87ff0356bd1f31f5c1c10'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Exploration",
    code: "exploration",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'exploration' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f88049b921c2f719d93f39'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "General Affairs",
    code: "GA",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'GA' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f89abb6ed397eeb5dc9d2e'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Geology Database",
    code: "Geology Database",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Geology Database' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f89af551985831c80c9d68'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Investor Relations & CSR",
    code: "Investor Relations & CSR",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Investor Relations & CSR' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f89afb9c7064f63af1f22f'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Legal & Corporate Secretary",
    code: "Legal & Corporate Secretary",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Legal & Corporate Secretary' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f89aff57c6eaa3a840f736'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Metallurgist",
    code: "Metallurgist",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Metallurgist' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f89b045296fa2b6c4164ea'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Mine Engineering & Infrastructure",
    code: "Mine Engineering & Infrastructure",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Mine Engineering & Infrastructure' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f89b0937e622b4a1e10921'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Project System & Support",
    code: "Project System & Support",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Project System & Support' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f89c5cc64748a0847165f6'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Reporting/Consolidation",
    code: "Reporting/Consolidation",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Reporting/Consolidation' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f89c611822aac806b4d7ec'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Risk Management",
    code: "Risk Management",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Risk Management' to department collection");
  });

  new department({
    _id: mongoose.Types.ObjectId('62f89c662c73214b48e32cad'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Tax",
    code: "Tax",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Tax' to department collection");
  });


  new department({
    _id: mongoose.Types.ObjectId('62f89c6a7ee94f68ac84b416'),
    company_by: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
    fullname: "Treasury",
    code: "Treasury",
    created_by: "system",
    updated_by: "system",
  }).save((err) => {
    if (err) {
      console.log("error", err);
    }
    console.log("added 'Treasury' to department collection");
  });

}

const division_define = async () => {
  try {

    let workbook = XLSX.readFile('./app/seeding/division-data.xlsx');
    let sheet_name_list = workbook.SheetNames;
    let xData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    let completeNormalize = []
    

    console.log("OK")
  } catch (error) {
    console.log(error)
  }

}

const position_define = async () => {
  try {

    let workbook = XLSX.readFile('./app/seeding/position.xlsx');
    let sheet_name_list = workbook.SheetNames;
    let xData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    let completeNormalize = []
    xData.forEach( async item => {
      
      let getUser = await User.findOne({ nik : item.NIK })
      getUser.position = item.Jabatan
      
      // getUser.save()
    })

  } catch (error) {
    console.log(error)
  }

}

const company_define = () => {
  Company.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Company({
        _id: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        fullname: "Bumi Resources Minerals",
        code: "BRM",
        business_entity: "A11",
        department: [
          mongoose.Types.ObjectId('6290531846873189f981064c'),
          mongoose.Types.ObjectId('6290531846873189f981064d'),
        ],
        created_by: "system",
        updated_by: "system",

      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Bumi Resources Minerals' to Company collection");
      });

      new Company({
        _id: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede9'),
        fullname: "Citra Palu Minerals",
        code: "CPM",
        business_entity: "C11",
        department: ['6290531846873189f981064e'],
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Citra Palu Minerals' to Company collection");
      });

      new Company({
        _id: mongoose.Types.ObjectId('db86d6a0ffa6eccb863bc6a6'),
        fullname: "Gorontalo Minerals",
        code: "GMR",
        business_entity: "G11",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Gorontalo Minerals' to Company collection");
      });

      new Company({
        _id: mongoose.Types.ObjectId('191a101589fb03e6d047e4c4'),
        fullname: "Dairi Prima Minerals",
        code: "DPM",
        business_entity: "D11",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Dairi Prima Minerals' to Company collection");
      });
    }
  });
};

const form_define = () => {
  Form.estimatedDocumentCount((err, count) => {

    if (!err && count === 0) {
      new Form({
        _id: mongoose.Types.ObjectId('629486c3d31d791048fc92fa'),
        name: "Time Sheet",
        code: "TS",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Time Sheet' to Form collection");
      });
      new Form({
        _id: mongoose.Types.ObjectId('9d01ae978e062bfe76270f8a'),
        name: "Travel Authority",
        code: "TA",
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Travel Authority' to Form collection");
      });
    }

  });
}

// Form settings for approvals
const form_approval_define = () => {
  FormApproval.estimatedDocumentCount((err, count) => {

    if (!err && count === 0) {
      new FormApproval({
        // Timesheet Direct Supervisor
        Forms: mongoose.Types.ObjectId('629486c3d31d791048fc92fa'),
        direct_spv: true,
        approved_by: null,
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Time Sheet' to Form Approval collection");
      });

      new FormApproval({
        // Travel Authority Custom Approved by based on id
        Forms: mongoose.Types.ObjectId('629886c6bd9ecf7712523567'),
        direct_spv: true,
        approved_by:
          [
            mongoose.Types.ObjectId('62b97ff0a39330b31b031df3'),
            mongoose.Types.ObjectId('62e1faa8bbebbf303dbed2d1')
          ],
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Time Sheet' to Form Approval collection");
      });
    }
  });
}

const level_define = () => {
  LevelUser.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {

      new LevelUser({
        _id: mongoose.Types.ObjectId('62f8bfb1af1707bb6c80e917'),
        fullname: "Director",
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Director' to User collection");
      });

      new LevelUser({
        _id: mongoose.Types.ObjectId('62f8bfb84bf9a334e91abdfa'),
        fullname: "Foreman/Officer",
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Foreman/Officer' to User collection");
      });

      new LevelUser({
        _id: mongoose.Types.ObjectId('62f8bfbd526201837efe336b'),
        fullname: "Non Staff",
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Non Staff' to User collection");
      });

      new LevelUser({
        _id: mongoose.Types.ObjectId('62f8bfc3d55a04103a0a3f76'),
        fullname: "Supervisor",
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Supervisor' to User collection");
      });

      new LevelUser({
        _id: mongoose.Types.ObjectId('62f8bfc887aaf8492dc23531'),
        fullname: "Superintendent",
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Superintendent' to User collection");
      });

      new LevelUser({
        _id: mongoose.Types.ObjectId('62f8bfcd9c5dbbccd9ed7953'),
        fullname: "Manager",
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Manager' to User collection");
      });

      new LevelUser({
        _id: mongoose.Types.ObjectId('62f8bfd2ad47f819520493ba'),
        fullname: "General Manager",
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'General Manager' to User collection");
      });

      new LevelUser({
        _id: mongoose.Types.ObjectId('62f8bfd811eea0bfb78f0c9b'),
        fullname: "Vice President",
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        created_by: "system",
        updated_by: "system",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'Vice President' to User collection");
      });
    }
  });

}

const user_cpm_define = () => {
  let workbook = XLSX.readFile('./app/seeding/CPM-User.xlsx');
  let sheet_name_list = workbook.SheetNames;
  let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  // user
  let roles_user = mongoose.Types.ObjectId('62b97ff0a39330b31b03edf0');
  let company = mongoose.Types.ObjectId('62b97ff0a39330b31b03ede9')

  xlData.forEach(async data => {

    try {
      let result = await User.findOne({
        nik: data.EmployeeID
      })

      if (!result) {
        let status = await new User({
          nik: data.EmployeeID,
          fullname: data.EmployeeName.trim(),
          password: bcrypt.hashSync(String(data.nik)),
          roles: roles_user,
          company: company,
          created_by: "system",
          updated_by: "system",
        })

        status.save()
        console.log(status)
      }
    } catch (error) {
      console.log(error)
    }
  })
}

const user_brm_define = () => {

  let workbook = XLSX.readFile('./app/seeding/BRMS-User.xlsx');
  let sheet_name_list = workbook.SheetNames;
  let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  // user
  let roles_user = mongoose.Types.ObjectId('62b97ff0a39330b31b03edf0');
  let roles_admin = mongoose.Types.ObjectId('62f84b82493ea74c934295a0')

  xlData.forEach(data => {

    // added Admin
    if (data.id_user == '62f8f34ea5375b5b0bdbdb36'
      || data.id_user == '62f8f2232c46c27614be4129'
      || data.id_user == '62f8f2d73e6b8f8c4d89e960') {
      console.log(String(data.nik))
      new User({
        _id: data.id_user,
        nik: data.nik,
        fullname: data.name,
        phone_number: data.number_phone,
        email: data.email,
        password: bcrypt.hashSync(String(data.nik)),
        direct_spv: data.supervisor_id,
        roles: roles_admin,
        department: data.department,
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        level: data.level,
        created_by: "system",
        updated_by: "system",
      })
        .save((err) => {
          if (err) {
            console.log("error", err);
          }
          console.log("added " + data.name + " collection");
        });

    } else {
      new User({
        _id: data.id_user,
        nik: data.nik,
        fullname: data.name,
        phone_number: data.number_phone,
        email: data.email,
        password: bcrypt.hashSync("BRMS@2022"),
        direct_spv: data.supervisor_id,
        roles: roles_user,
        department: data.department,
        company: mongoose.Types.ObjectId('62b97ff0a39330b31b03ede8'),
        level: data.level,
        created_by: "system",
        updated_by: "system",
      })
        .save((err) => {
          if (err) {
            console.log("error", err);
          }
          console.log("added " + data.name + " collection");
        });

    }
  })
}

const importSumBilling = async () => {
  let workbook = XLSX.readFile('./app/seeding/biltelco_sum.xlsx');
  let sheet_name_list = workbook.SheetNames;
  let xData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  let completeNormalize = []

  try {
    xData.forEach(data => {

      normalizedXData = {}

      Object.keys(xData[0]).map(function (columnName) {
        normalizedXData[columnName.toLowerCase().trim().replace(/[^A-Z0-9]+/ig, "_").replace(/([_/]*)$/ig, "")] = xData[columnName] = data[columnName]
      })

      completeNormalize.push(normalizedXData)

    })

    await ITBillingTelkomMST.insertMany(completeNormalize)
    console.log("Complete")

  } catch (error) {
    console.log(error)
  }
}

const importDetailBilling = async () => {
  let workbook = XLSX.readFile('./app/seeding/biltelco_detail.xlsx');
  let sheet_name_list = workbook.SheetNames;
  let xData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  let completeNormalize = []

  try {
    xData.forEach(data => {

      normalizedXData = {}

      Object.keys(xData[0]).map(function (columnName) {
        normalizedXData[columnName.toLowerCase().trim().replace(/[^A-Z0-9]+/ig, "_").replace(/([_/]*)$/ig, "")] = xData[columnName] = data[columnName]
      })

      completeNormalize.push(normalizedXData)

    })

    await ITBillingTelkomDTL.insertMany(completeNormalize)
    console.log("Complete")

  } catch (error) {
    console.log(error)
  }


}

String.prototype.capitalize = function (lower) {
  return (lower ? this.toLowerCase() : this).replace(/(?:^|\s|['`‘’.-])[^\x00-\x60^\x7B-\xDF](?!(\s|$))/g, function (a) {
    return a.toUpperCase();
  });
};

const importMstBilling = async () => {
  try {

    let workbook = XLSX.readFile('./app/seeding/ref-user-biltelko.xlsx');
    let sheet_name_list = workbook.SheetNames;
    let xData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    let completeNormalize = []

    xData.forEach(xdata => {
      completeNormalize.push({
        name: xdata.nama || 'Bumi Resources Minerals',
        telp: xdata.telp,
        provider: xdata.provider,
        business_entity: xdata.BE
      })
    })

    await ITBillingTelkomMST.insertMany(completeNormalize)

    console.log('ok')
  } catch (error) {
    console.log(error)
  }

}

const initial = {
  importMstBilling,
  importSumBilling,
  importDetailBilling,
  form_approval_define,
  company_define,
  role_define,
  form_define,
  department_define,
  division_define,
  level_define,
  user_brm_define,
  user_cpm_define,
  position_define,
  application_define
};

module.exports = initial;
