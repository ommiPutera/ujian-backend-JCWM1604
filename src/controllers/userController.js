const { mySqldb } = require("../connection");
const { createAccessToken } = require("../helpers/createToken");
const { hashpassword } = require("../helpers/hassingPassword");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");
const dba = promisify(mySqldb.query).bind(mySqldb);

module.exports = {
  Register: async (req, res) => {
    try {
      const { username, password, email } = req.body;
      const validationInput = new RegExp("^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[.*+!?^${}()|[/]\\])").test(password);
      // const validatioSpesialCharater = new RegExp ).test(password)
      if (username.length < 6) {
        return res.status(400).send({ message: `username must be at least 6 character` });
      } else if (!email.includes("@")) {
        return res.status(400).send({ message: `email must contain @ character` });
      }
      if (!username || !email || !password) {
        let inputUser;
        if (!username) {
          inputUser = 'username'
        } else if (!password) {
          inputUser = 'password'
        } else if (!email) {
          inputUser = 'email'
        }
        return res.status(400).send({ message: `${inputUser} must be filled in` });
      } else if (password.length < 6) {
        return res.status(400).send({ message: `password must be at least 6 character` });
      } else if (!validationInput) {
        return res.status(400).send({ message: `password must contain a number, uppercase and lowercase, and spesial charatcer` });
      };
      let sql = `select * from users where username = ? and email = ?`;
      let dataUser = await dba(sql, [username, email]);
      if (dataUser.length) {
        return res.status(500).send({ message: "username has been registed" });
      } else {
        sql = `insert into users set ?`;
        const uid = uuidv4();
        let dataInsert = {
          username: username,
          email: email,
          uid: uid,
          password: hashpassword(password)
        };
        dataUser = await dba(sql, dataInsert);
        // select data serta token user yang baru saja register sebagai response
        sql = `select id, uid, username, email from users where uid = ? `;
        dataUser = await dba(sql, uid);
        let datatoken = {
          id: dataUser[0].id,
          username: dataUser[0].username,
        };
        const tokenAccess = createAccessToken(datatoken);
        return res.status(200).send({ ...dataUser[0], tokenAccess });
      };
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  },
  Login: async (req, res) => {
    try {
      const { user, password } = req.body;
      if (!user || !password) return res.status(400).send({ message: "bad request" });
      let sql = `select * from users where id = ?`;
      let dataUser = await dba(sql, req.user.id);
      if (dataUser[0].status == 0  ) {
        return res.status(500).send({ message: "cannot login because user account is deactive" });
      } else if (dataUser[0].status == 3) {
        return res.status(500).send({ message: "cannot login because user account is close" });
      } else {
        sql = `select id, uid, username from users where (email = ? or username = ?) and password = ?`
        dataUser = await dba(sql, [user, user, hashpassword(password)]);
        if (dataUser.length) {
          return res.status(200).send({ ...dataUser[0] });
        }
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  },
  ActivateAccount: async (req, res) => {
    try {
      const dataUpdate = { status: 1 };
      let sql = `select * from users where id = ?`;
      let dataUser = await dba(sql, [req.user.id]);
      if (dataUser[0].status == 1) {
        return res.status(500).send({ message: "cannot change status because users account is active" });
      } else if (dataUser[0].status == 3) {
        return res.status(500).send({ message: "cannot change status because user account is close" });
      } else {
        sql = `update users set ? where id = ?`;
        dataUser = await dba(sql, [dataUpdate, req.user.id]);
        sql = `select uid, status from users where id = ?`
        dataUser = await dba(sql, req.user.id)
        return res.status(200).send({ ...dataUser[0], status: 'active' });
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  },
  DeactiveAccount: async (req, res) => {
    try {
      const dataUpdate = { status: 0 };
      let sql = `select * from users where id = ?`;
      let dataUser = await dba(sql, [req.user.id]);
      if (dataUser[0].status == 0) {
        return res.status(500).send({ message: "cannot change status because users is deactive" });
      } else {
        sql = `update users set ? where id = ?`;
        dataUser = await dba(sql, [dataUpdate, req.user.id]);
        sql = `select uid from users where id = ?`
        dataUser = await dba(sql, req.user.id)
        return res.status(200).send({ ...dataUser[0], status: 'deactive' });
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  },
  CloseAccount: async (req, res) => {
    try {
      const dataUpdate = { status: 3 };
      let sql = `select * from users where id = ?`;
      let dataUser = await dba(sql, [req.user.id]);
      if (dataUser[0].status == 3) {
        return res.status(500).send({ message: "cannot change status because users is close" });
      } else {
        sql = `update users set ? where id = ?`;
        dataUser = await dba(sql, [dataUpdate, req.user.id]);
        sql = `select uid from users where id = ?`
        dataUser = await dba(sql, req.user.id)
        return res.status(200).send({ ...dataUser[0], status: 'closed' });
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  },
};