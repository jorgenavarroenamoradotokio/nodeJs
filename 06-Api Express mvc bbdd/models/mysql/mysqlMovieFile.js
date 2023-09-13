import mysql from "mysql2/promise";

const DEFAULT_CONFIG = {
  host: "localhost",
  user: "root",
  port: 3306,
  password: "123456789",
  database: "movies",
};
const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG;

const connection = await mysql.createConnection(connectionString);

export class MovieModel {
  static async getAll({ genre }) {
    console.log("getAll");

    if (genre) {
      const lowerCaseGenre = genre.toLowerCase();

      // get genre ids from database table using genre names
      const [genres] = await connection.query(
        "SELECT id, name FROM genre WHERE LOWER(name) = ?;",
        [lowerCaseGenre]
      );

      // no genre found
      if (genres.length === 0) return [];

      // get the id from the first genre result
      const [{ id }] = genres;

      // get all movies ids from database table
      // la query a movie_genres
      // join
      // y devolver resultados..
      return [];
    }

    const [movies] = await connection.query(
      "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie;"
    );

    return movies;
  }

  static async getById({ id }) {
    const strSql = "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie WHERE id = UUID_TO_BIN(?);";
    const [movies] = await connection.query(strSql, [id]);

    if (movies.length === 0) return null;
    return movies[0];
  }

  static async create({ object }) {
    const {
      genre: genreInput, // genre is an array
      title,
      year,
      duration,
      director,
      rate,
      poster,
    } = object;

    // todo: crear la conexión de genre

    // crypto.randomUUID()
    const [uuidResult] = await connection.query("SELECT UUID() uuid;");
    const [{ uuid }] = uuidResult;

    try {
      await connection.query(
        `INSERT INTO movie (id, title, year, director, duration, poster, rate)
          VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
        [title, year, director, duration, poster, rate]
      );
    } catch (e) {
      // puede enviarle información sensible
      throw new Error("Error creating movie");
      // enviar la traza a un servicio interno
      // sendLog(e)
    }

    const [movies] = await connection.query(
      `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id
        FROM movie WHERE id = UUID_TO_BIN(?);`,
      [uuid]
    );

    return movies[0];
  }

  static async delete({ id }) {
    

    try {
      const movie = await this.movieModel.getById(id);
      if (movie){
        const strSql = "DELETE FROM movie where BIN_TO_UUID(id) = ?";
        const [movies] = await connection.query(strSql, [id]);
      }
    } catch (e) {}
  }

  static async update({ id, object }) {
    // ejercicio fácil: crear el update
  }
}
