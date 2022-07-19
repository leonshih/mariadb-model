const Model = require('./Model');
class EnterpriseModel extends Model {
  constructor() {
    super();
    this.table = 'enterprise';
    this.tableColumns = {
      /** 需轉型成CHAR之欄位(因javascript無法處理bigint) */
      bigint: ['uid', 'created_by', 'updated_by', 'deleted_by'],
      /** 其他欄位 */
      general: [
        'code',
        'name',
        'identity_id',
        'enterprise_type',
        'timezone',
        'address',
        'plan',
        'settings',
        'created_at',
        'updated_at',
        'deleted',
        'deleted_at',
      ],
    };
  }

  create(data) {
    return new Enterprise(data);
  }
}

class Enterprise {
    constructor(data) {
    this.uid = data.uid ?? null;
    this.code = data.code ?? null;
    this.name = data.name ?? null;
    this.identityId = data.identityId ?? '';
    this.enterpriseType = data.enterpriseType ?? null;
    this.timezone = data.timezone ?? '+0800';
    this.address = data.address ?? null;
    this.plan = data.plan ?? null;
    this.settings = data.settings ?? null;
    this.createdAt = data.createdAt ?? new Date();
    this.createdBy = data.createdBy ?? null;
    this.updatedAt = data.updatedAt ?? null;
    this.updatedBy = data.updatedBy ?? null;
    this.deleted = data.deleted ?? 0;
    this.deletedAt = data.deletedAt ?? null;
    this.deletedBy = data.deletedBy ?? null;
}
}

module.exports = EnterpriseModel;
