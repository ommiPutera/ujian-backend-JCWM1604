const { mySqldb } = require("../connection");
const { createAccessToken } = require("../helpers/createToken");
const { hashpassword } = require("../helpers/hassingPassword");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");
const dba = promisify(mySqldb.query).bind(mySqldb);

module.exports = {
  contoh: async (req, res) => {
    try {
      const contohquery = req.query;
      let sql = `select * from movie where status = ?`;
      const dataMovie = await dba(sql, contohquery.status);
      return res.status(200).send(dataMovie);
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  },
  GetAllMovie: async (req, res) => {
    try {
      let sql = `select * from movies`
      let dataMovie = await dba(sql)
      return res.status(200).send(dataMovie)
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  },
  GetMovieByQuery: async (req, res) => {
    try {
      let status = req.query.status;
      let location = req.query.location;
      let time = req.query.time;
      if (status, location, time) {
        let sql = `select * from movies where status = ?`;
        const dataMovie = await dba(sql, status);
        return res.status(200).send(dataMovie);
      } else if (status) {
        if(status == "upcoming") {
          status = 1
        } else if (status == "on show") {
          status = 2
        } else if (status == "has shown" ) {
          status = 3
        }
        let sql = `select * from movies where status = ?`;
        const dataMovie = await dba(sql, status);
        return res.status(200).send(dataMovie);
      } else if (location) {
        if(location == "bandung") {
          location = 1
        } else if (location == "jakarta") {
          location = 2
        } else if (location == "serpong" ) {
          location = 3
        }
        let sql = `select * from movies m 
        join schedules s on m.id = s.movie_id where s.location_id = ?`;
        const dataMovie = await dba(sql, location);
        return res.status(200).send(dataMovie);
      } else if (time) {
        if(time == "9 AM") {
          time = 1
        } else if (time == "11 AM") {
          time = 2
        } else if (time == "1 PM" ) {
          time = 3
        } else if (time == "3 PM" ) {
          time = 4
        }else if (time == "7 PM" ) {
          time = 5
        }else if (time == "9 PM" ) {
          time = 6
        }
        console.log(time)
        let sql = `select * from schedules s join movies m join show_times st on st.id = s.time_id and s.movie_id = m.id where st.id = ?`;
        const dataMovie = await dba(sql, time);
        return res.status(200).send(dataMovie);
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  },
  PostFilm: async (req, res) => {
    try {
      const { name, genre, release_date, release_month, release_year, duration_min, description } = req.body;
      let dataInsert = {
        name: name,
        genre: genre,
        release_date: release_date, 
        release_month: release_month, 
        release_year: release_year,
        duration_min: duration_min,
        description: description
      }
      let sql = `select * from users s
      join roles r on r.id = s.role
      where r.role = 'admin'`;
      const dataAdmin = await dba(sql);
      console.log(dataAdmin[0].id)
      if (dataAdmin[0].id) {
        console.log('bisa')
        sql = `insert into movies set ?`
      } else {
        return res.status(500).send({ message: "hanya admin yang boleh add movie" });
      }
      let dataMovie = await dba(sql, dataInsert)
      sql = `select * from movies where name = ?`
      dataMovie = await dba(sql, name)
      return res.status(200).send(dataMovie);
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  },
  ChangeStatusFilm: async (req, res) => {
    try {
     const {status} = req.body;
      const dataUpdate = {
        status: status
      }
      const { id } = req.params;
      let sql = `update movies set ? where id = ? `
      let dataMovie = await dba(sql, [dataUpdate, id])
      dataMovie = await dba(sql, id)
      sql = `select id from movies where id = ?`
      return res.status(200).send({dataMovie, message: "status has been changed"});
    } catch (error) {
      console.log(error)
      return res.status(500).send({ message: "server error" });
    }
  }
};