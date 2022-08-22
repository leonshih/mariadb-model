const mariadb = require('mariadb');
const snakecaseKeys = require('snakecase-keys');
const camelCaseKeys = require('camelcase-keys');
const logger = require('../logger');

const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
class Model {
  constructor() {
    this.table = '';
    this.tableColumns = [];
  }

  async getConnection() {
    const pool = mariadb.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: process.env.DB_NAME,
      connectionLimit: process.env.DB_POOL_SIZE,
      ssl: process.env.DB_SSL === '1',
      collation: 'UTF8MB4_GENERAL_CI',
      timezone: 'UTC',
    });

    try {
      const conn = await pool.getConnection();
      return conn;
    } catch (err) {
      logger.error(`Database connection failed. ${err.message}`);
      process.exit(1);
    } finally {
      pool.end();
    }
  }

  /**
   * 根據條件取得所有資料
   * @param {object} condition 搜尋條件
   * @param {Object} projection
   * @param {Array.<String>} projection.params 需要查詢的參數
   * @param {Array.<Object>} projection.includes 需要查詢的關聯資料表
   * @param {Object} projection.includes[].table 關聯資料表
   * @param {Array.<String>} projection.includes[].alias 主資料表的欄位名稱（可省略）
   * @param {Array.<String>} projection.includes[].params 關聯資料表需要查詢的參數
   * @param {Array.<Object>} projection.like 需要模糊比對的參數
   * @param {String} projection.like[].param 模糊比對的參數名稱
   * @param {String} projection.like[].value 模糊比對的參數值
   * @param {Boolean} projection.createByModel 是否以Model建立物件
   * @param {String} projection.contains[].param 需要IN比對的參數名稱
   * @param {Array.<Object>} projection.contains[].value[] 需要IN比對的參數值
   * @param {String} projection.gte[].param 大於等於的參數名稱
   * @param {String} projection.gte[].value 大於等於的參數值
   * @param {String} projection.lte[].param 小於等於的參數名稱
   * @param {String} projection.lte[].value 小於等於的參數值
   * @param {String} projection.gt[].param 大於的參數名稱
   * @param {String} projection.gt[].value 大於的參數值
   * @param {String} projection.lt[].param 小於的參數名稱
   * @param {String} projection.lt[].value 小於的參數值
   * @param {boolean} projection.paranoid 是否為軟刪除
   * @returns {array}
   * @example
   * await usersModel.find(
      {
        enterpriseUid: chatRoom.enterpriseUid,
      },
      {
        params: ["uid", "enterpriseUid"],
        includes: [
            {
                table: new model.EnterpriseModel(),
                params: ["uid", "name"],
            },
            {
                table: new model.OptionsModel(),
                alias: "department",
                params: ["uid", "name"],
            },
        ],
        like: [ // 模糊搜尋
          {
            param: "type",
            value: "admin",
          },
        ],
        createByModel: true, //是否以model建立物件
        contains: [
          {
            param: "uid",
            value: carUidList.map((cu) => cu.carUid),
          },
        ],
      }
    );
   */
  async find(condition, projection = {}) {
    const conn = await this.getConnection();

    let sql = this.getSelectQuery(projection);

    if (condition) sql += this.getWhereQuery(condition, projection);

    try {
      const resData =
        (condition
          ? await conn.query(sql, this.getQueryValues(condition))
          : await conn.query(sql)) ?? [];

      delete resData.meta;

      return projection.createByModel
        ? camelCaseKeys(resData).map((obj) => this.create(obj))
        : camelCaseKeys(resData);
    } catch (err) {
      console.log(`${this.table}Model.find: ${err};\nsql: ${sql}`);
      return null;
    } finally {
      conn.release();
    }
  }

  /**
   * 根據條件取得所有資料
   * @param {object} condition 搜尋條件
   * @param {Object} projection
   * @param {Array.<String>} projection.params 需要查詢的參數
   * @param {Array.<Object>} projection.includes 需要查詢的關聯資料表
   * @param {Object} projection.includes[].table 關聯資料表
   * @param {Array.<String>} projection.includes[].alias 主資料表的欄位名稱（可省略）
   * @param {Array.<String>} projection.includes[].params 關聯資料表需要查詢的參數
   * @param {Array.<Object>} projection.like 需要模糊比對的參數
   * @param {String} projection.like[].param 模糊比對的參數名稱
   * @param {String} projection.like[].value 模糊比對的參數值
   * @param {Boolean} projection.createByModel 是否以Model建立物件
   * @param {String} projection.contains[].param 需要IN比對的參數名稱
   * @param {Array.<Object>} projection.contains[].value[] 需要IN比對的參數值
   * @param {String} projection.gte[].param 大於等於的參數名稱
   * @param {String} projection.gte[].value 大於等於的參數值
   * @param {String} projection.lte[].param 小於等於的參數名稱
   * @param {String} projection.lte[].value 小於等於的參數值
   * @param {String} projection.gt[].param 大於的參數名稱
   * @param {String} projection.gt[].value 大於的參數值
   * @param {String} projection.lt[].param 小於的參數名稱
   * @param {String} projection.lt[].value 小於的參數值
   * @param {boolean} projection.paranoid 是否為軟刪除
   * @returns {array}
   * @example
   * await usersModel.findOne(
      {
        enterpriseUid: chatRoom.enterpriseUid,
      },
      {
        params: ["uid", "enterpriseUid"],
        includes: [
            {
                table: new model.EnterpriseModel(),
                params: ["uid", "name"],
            },
            {
                table: new model.OptionsModel(),
                alias: "department",
                params: ["uid", "name"],
            },
        ],
        like: [ // 模糊搜尋
          {
            param: "type",
            value: "admin",
          },
        ],
        createByModel: true, //是否以model建立物件
        contains: [
          {
            param: "uid",
            value: carUidList.map((cu) => cu.carUid),
          },
        ],
      }
    );
   */
  async findOne(condition, projection = {}) {
    const conn = await this.getConnection();

    let sql = this.getSelectQuery(projection);

    if (condition) sql += this.getWhereQuery(condition, projection);

    sql += ' LIMIT 1';

    try {
      const resData =
        (condition
          ? (await conn.query(sql, this.getQueryValues(condition)))[0]
          : (await conn.query(sql))[0]) ?? null;

      return projection.createByModel
        ? this.create(camelCaseKeys(resData))
        : camelCaseKeys(resData);
    } catch (err) {
      console.log(`${this.table}Model.findOne: ${err.message}`);
      return null;
    } finally {
      conn.release();
    }
  }

  /**
   * 新增單筆或多筆資料
   * @param {object} data
   * @param {object} conn
   * @returns
   */
  async insert(data, conn = null) {
    const needToRelease = !conn;
    if (!conn) conn = await this.getConnection();

    const sql = this.getInsertQuery(data);
    const insertValues = this.getInsertValues(data);

    try {
      return {
        success: true,
        data: Array.isArray(data)
          ? await conn.batch(sql, insertValues)
          : await conn.query(sql, insertValues),
      };
    } catch (err) {
      console.log(`${this.table}Model.insert: ${err}`);
      console.log({ sql, insertValues });
      return { success: false, message: err.message };
    } finally {
      if (needToRelease) conn.release();
    }
  }

  /**
   * 更新資料
   * @param {object} data
   * @param {object} projection.condition // 搜尋條件
   * @param {object} projection.updatedBy // 更新者uid
   * @param {*} conn
   * @returns
   */
  async update(data, projection = {}, conn = null) {
    const needToRelease = !conn;
    if (!conn) conn = await this.getConnection();

    const _data = snakecaseKeys(data);
    Object.keys(_data).forEach((k) => _data[k] == null && delete _data[k]);

    if (projection.updatedBy) _data.updated_by = projection.updatedBy;

    let sql = `UPDATE ${this.table} SET updated_at = NOW() `;

    if (Object.keys(_data).length > 0) {
      sql += `, ${this.getUpdateQuery(_data)} `;
    }

    sql += this.getWhereQuery(projection.condition);

    try {
      const updateRes = await conn.query(
        sql,
        this.getQueryValues(_data).concat(
          this.getQueryValues(projection.condition)
        )
      );
      return {
        success: true,
        data: updateRes,
      };
    } catch (err) {
      console.log(`${this.table}Model.update: ${err.message}`);
      return { success: false, message: err.message };
    } finally {
      if (needToRelease) conn.release();
    }
  }

  /**
   * 標視為已刪除
   * @param {object} condition 搜尋條件
   * @param {string} projection.deletedBy 刪除者uid
   * @param {object} conn
   * @returns
   */
  async markDeleted(condition, projection = {}, conn = null) {
    const needToRelease = !conn;
    if (!conn) conn = await this.getConnection();

    const _condition = snakecaseKeys(condition);

    let sql = `UPDATE ${this.table} SET deleted = 1, deleted_at = NOW() `;

    if (projection.deletedBy) sql += `, deleted_by = ${projection.deletedBy} `;

    sql += this.getWhereQuery(_condition);

    try {
      const deleteRes = await conn.query(sql, this.getQueryValues(_condition));
      return {
        success: true,
        data: deleteRes,
      };
    } catch (err) {
      console.log(`${this.table} markDeleted: ${err.message}`);
      return { success: false, message: err.message };
    } finally {
      if (needToRelease) conn.release();
    }
  }

  /**
   * 實際刪除DB資料
   * @param {object} condition
   * @param {object} conn
   * @returns
   */
  async delete(condition, conn = null) {
    const needToRelease = !conn;
    if (!conn) conn = await this.getConnection();

    const _condition = snakecaseKeys(condition);

    const sql = `DELETE FROM ${this.table} ${this.getWhereQuery(_condition)}`;

    try {
      const deleteRes = await conn.query(sql, this.getQueryValues(_condition));
      return {
        success: true,
        data: deleteRes,
      };
    } catch (err) {
      console.log(`${this.table} delete: ${err.message}`);
      return { success: false, message: err.message };
    } finally {
      if (needToRelease) conn.release();
    }
  }

  /**
   * 取得SELECT 字串
   * @param {Object} projection
   * @param {Array.<String>} projection.params 需要查詢的參數
   * @param {Array.<Object>} projection.includes 需要查詢的關聯資料表
   * @param {Object} projection.includes[].table 關聯資料表
   * @param {Array.<String>} projection.includes[].alias 主資料表的欄位名稱（可省略）
   * @param {Array.<String>} projection.includes[].params 關聯資料表需要查詢的參數
   * @example
   * const projection = {
      params: ["uid", "enterpriseUid"],
      includes: [
        {
          table: new model.EnterpriseModel(),
          params: ["uid", "name"],
        },
        {
          table: new model.OptionsModel(),
          alias: "department",
          params: ["uid", "name"],
        },
      ]
    };
    const selectQueryStr = usersModel.getSelectQuery(projection);
   */
  getSelectQuery(projection = {}) {
    const { params, includes } = projection;
    let sql = 'SELECT ';

    if (params && params.length > 0) {
      sql += params
        .map((param) =>
          this.tableColumns.bigint.includes(camelToSnakeCase(param))
            ? `CAST(${this.table}.${camelToSnakeCase(
                param
              )} AS CHAR) AS ${camelToSnakeCase(param)}`
            : `${this.table}.${camelToSnakeCase(param)}`
        )
        .join(', ');
    } else {
      sql += `${this.tableColumns.bigint
        .map((column) => {
          return `CAST(${this.table}.${column} AS CHAR) AS ${column}`;
        })
        .join(', ')}`;

      if (this.tableColumns.general.length > 0) {
        if (sql !== 'SELECT ') sql += ', ';
        sql += `${this.tableColumns.general
          .map((column) => {
            return `${this.table}.${column}`;
          })
          .join(', ')}`;
      }
    }

    if (includes && Object.keys(includes).length > 0) {
      includes.forEach((include) => {
        sql += ', ';
        const { table, alias, params } = include;

        sql += params
          .map((param) => {
            return table.tableColumns.bigint.includes(camelToSnakeCase(param))
              ? `CAST(${table.table}.${camelToSnakeCase(param)} AS CHAR) AS ${
                  alias ? alias : table.table
                }_${camelToSnakeCase(param)}`
              : `${table.table}.${camelToSnakeCase(param)} AS ${
                  alias ? alias : table.table
                }_${camelToSnakeCase(param)}`;
          })
          .join(', ');
      });
    }

    sql += ` FROM ${this.table}`;

    if (includes && Object.keys(includes).length > 0) {
      includes.forEach((include) => {
        const { table, alias } = include;
        sql += alias
          ? ` LEFT JOIN ${table.table} ON ${this.table}.${camelToSnakeCase(
              alias
            )}_uid = ${table.table}.uid`
          : ` LEFT JOIN ${table.table} ON ${this.table}.${table.table}_uid = ${table.table}.uid`;
      });
    }

    return sql;
  }

  /**
   * 取得WHERE字串 (條件)
   * @param {Object} data
   * @param {Object} projection
   * @param {Array.<Object>} projection.like 需要模糊比對的參數
   * @param {String} projection.like[].param 模糊比對的參數名稱
   * @param {String} projection.like[].value 模糊比對的參數值
   * @param {String} projection.contains[].param 需要IN比對的參數名稱
   * @param {Array.<Object>} projection.contains[].value[] 需要IN比對的參數值
   * @param {String} projection.gte[].param 大於等於的參數名稱
   * @param {String} projection.gte[].value 大於等於的參數值
   * @param {String} projection.lte[].param 小於等於的參數名稱
   * @param {String} projection.lte[].value 小於等於的參數值
   * @param {String} projection.gt[].param 大於的參數名稱
   * @param {String} projection.gt[].value 大於的參數值
   * @param {String} projection.lt[].param 小於的參數名稱
   * @param {String} projection.lt[].value 小於的參數值
   * @param {boolean} projection.paranoid 是否為軟刪除
   * @example
   * 
     usersModel.getWhereQuery(
      {
        enterpriseUid: "99790745107431484",
        zhName: "testName",
      },
      {
        like: [{ param: "type", value: "admin" }],
      }
    );
   */
  getWhereQuery(conditions, projection = {}) {
    const { like, gte, lte, gt, lt, contains, paranoid } = projection;
    let whereQuery = ' WHERE 1=1';

    if (Object.keys(conditions).length > 0) {
      whereQuery += ` AND ${Object.keys(conditions)
        .map((key) => {
          if (Array.isArray(conditions[key]))
            return `(${conditions[key]
              .map((param) => this.handleCastCase(key))
              .join(' OR ')})`;
          return this.handleCastCase(key);
        })
        .join(' AND ')}`;
    }

    if (like && like.length > 0) {
      whereQuery += ` AND ${like
        .map(
          (obj) =>
            `${this.table}.${camelToSnakeCase(obj.param)} LIKE '%${obj.value}%'`
        )
        .join(' AND ')}`;
    }

    if (contains && contains.length > 0) {
      whereQuery += ` AND ${contains
        .map((obj) =>
          this.tableColumns.bigint.includes(camelToSnakeCase(obj.param))
            ? `CAST(${this.table}.${camelToSnakeCase(
                obj.param
              )} AS CHAR) IN (${obj.value
                .map((item) => `'${item}'`)
                .join(', ')})`
            : `${this.table}.${camelToSnakeCase(obj.param)} IN (${obj.value
                .map((item) => `'${item}'`)
                .join(', ')})`
        )
        .join(' AND ')}`;
    }

    if (gte && gte.length > 0) {
      whereQuery += ` AND ${gte
        .map(
          (obj) =>
            `${this.table}.${camelToSnakeCase(obj.param)} >= '${obj.value}'`
        )
        .join(' AND ')}`;
    }

    if (lte && lte.length > 0) {
      whereQuery += ` AND ${lte
        .map(
          (obj) =>
            `${this.table}.${camelToSnakeCase(obj.param)} <= '${obj.value}'`
        )
        .join(' AND ')}`;
    }

    if (gt && gt.length > 0) {
      whereQuery += ` AND ${gt
        .map(
          (obj) =>
            `${this.table}.${camelToSnakeCase(obj.param)} > '${obj.value}'`
        )
        .join(' AND ')}`;
    }

    if (lt && lt.length > 0) {
      whereQuery += ` AND ${lt
        .map(
          (obj) =>
            `${this.table}.${camelToSnakeCase(obj.param)} < '${obj.value}'`
        )
        .join(' AND ')}`;
    }

    if (this.tableColumns.general.includes('deleted') && paranoid !== false) {
      whereQuery += ` AND ${this.table}.deleted = 0`;
    }
    return whereQuery;
  }

  /**
   * 取得INSERT字串(可單筆或多筆)
   * @param {Object|Array.<Object>} data 可以是array或object
   * @returns
   */
  getInsertQuery(data) {
    if (Array.isArray(data)) {
      const keys = Object.keys(data[0])
        .map((key) => {
          if (
            this.tableColumns.bigint.includes(camelToSnakeCase(key)) ||
            this.tableColumns.general.includes(camelToSnakeCase(key))
          )
            return camelToSnakeCase(key);
        })
        .filter((key) => key);

      return `INSERT INTO ${this.table} (${keys}) VALUES (${keys
        .map(() => '?')
        .join(', ')})`;
    }

    const keys = Object.keys(data)
      .map((key) => {
        if (
          this.tableColumns.bigint.includes(camelToSnakeCase(key)) ||
          this.tableColumns.general.includes(camelToSnakeCase(key))
        )
          return camelToSnakeCase(key);
      })
      .filter((key) => key);

    return `INSERT INTO ${this.table} (${keys}) VALUES (${keys
      .map(() => '?')
      .toString()})`;
  }

  getInsertValues(conditions) {
    return Array.isArray(conditions)
      ? conditions.map((obj) => {
          return Object.keys(obj)
            .map((key) => {
              if (
                this.tableColumns.bigint.includes(camelToSnakeCase(key)) ||
                this.tableColumns.general.includes(camelToSnakeCase(key))
              )
                return obj[key];
            })
            .filter((d) => typeof d !== 'undefined');
        })
      : Object.keys(conditions)
          .map((key) => {
            if (
              this.tableColumns.bigint.includes(camelToSnakeCase(key)) ||
              this.tableColumns.general.includes(camelToSnakeCase(key))
            )
              return conditions[key];
          })
          .filter((d) => typeof d !== 'undefined')
          .flat();
  }

  getUpdateQuery(data) {
    return Object.keys(snakecaseKeys(data))
      .map((key) => `${key} = ?`)
      .join(', ');
  }

  getQueryValues(conditions) {
    return Array.isArray(conditions)
      ? conditions.map((d) => {
          return Object.values(d);
        })
      : Object.values(conditions).flat();
  }

  async generateUUID() {
    const conn = await this.getConnection();

    try {
      const sql = `
            SELECT CAST(UUID_SHORT() AS CHAR) AS uid
        `;

      const result = await conn.query(sql);
      return result[0].uid;
    } catch (err) {
      logger.error(`Database connection failed. ${err.message}`);
      process.exit(1);
    } finally {
      conn.release();
    }
  }

  handleCastCase(param) {
    return this.tableColumns.bigint.includes(camelToSnakeCase(param))
      ? `CAST(${this.table}.${camelToSnakeCase(param)} AS CHAR) = ?`
      : `${this.table}.${camelToSnakeCase(param)} = ?`;
  }
}

module.exports = Model;
