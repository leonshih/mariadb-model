const Model = require('./Model');
class UserModel extends Model {
  constructor() {
    super();
    this.table = 'user';
    this.tableColumns = {
      /** 需轉型成CHAR之欄位(因javascript無法處理bigint) */
      bigint: [
        'uid',
        'enterprise_uid',
        'created_by',
        'updated_by',
        'deleted_by',
      ],
      /** 其他欄位 */
      general: [
        'name',
        'type',
        'email',
        'mobile',
        'password',
        'password_updated_at',
        'authority',
        'enabled',
        'created_at',
        'updated_at',
        'deleted',
        'deleted_at',
      ],
    };
  }

  create(data) {
    return new User(data);
  }
}

class User {
    constructor(data) {
        this.uid= data.uid ?? null;
        this.name= data.name ?? null;
        this.type= data.type ?? null;
        this.email= data.email ?? null;
        this.mobile= data.mobile ?? null;
        this.enterpriseUid= data.enterpriseUid ?? null;
        this.password= data.password ?? null;
        this.passwordUpdatedAt= data.passwordUpdatedAt ?? null;
        this.authority= data.authority ?? null;
        this.enabled= data.enabled ?? true;
        this.createdAt= data.createdAt ?? new Date();
        this.createdBy= data.createdBy ?? null;
        this.updatedAt= data.updatedAt ?? null;
        this.updatedBy= data.updatedBy ?? null;
        this.deleted= data.deleted ?? 0;
        this.deletedAt= data.deletedAt ?? null;
        this.deletedBy= data.deletedBy ?? null;
    }
}

module.exports = UserModel;
