const Model = require('./Model');
class OptionModel extends Model {
  constructor() {
    super();
    this.table = 'option';
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
        'category',
        'memo',
        'created_at',
        'updated_at',
        'deleted',
        'deleted_at',
        'apply_to',
      ],
    };
  }

  create(data) {
    return new Option(data);
  }
}

class Option {
    constructor(data) {
        this.uid = data.uid ?? null;
        this.enterprise_uid = data.enterpriseUid ?? null;
        this.name = data.name ?? null;
        this.category = data.category ?? null;
        this.memo = data.memo ?? null;
        this.createdBy = data.createdBy ?? null;
        this.updatedBy = data.updatedBy ?? null;
        this.deletedBy = data.deletedBy ?? null;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? null;
        this.deleted = data.deleted ?? false;
        this.deletedAt = data.deletedAt ?? null;
        this.applyTo = data.applyTo ?? null;
    }
}

module.exports = OptionModel;
