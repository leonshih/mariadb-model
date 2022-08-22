## 建立Model
- 宣告一class (e.g. UserModel) 繼承Model
- this.table為table名稱
- tableColumns中為資料表中之欄位名稱（以snake case命名)

    - bigint陣列內容為資料型態為bigint之欄位
    - general則為其他資料型態之欄位
- create function為
```javascript
const Model = require('./Model');
class UsersModel extends Model {
  constructor() {
    super();
    this.table = 'user';
    this.tableColumns = {
      bigint: [
        'uid',
        'enterprise_uid',
        'created_by',
        'updated_by',
        'deleted_by',
      ],
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
        this.uid= model.uid ?? null;
        this.name= model.name ?? null;
        this.type= model.type ?? null;
        this.email= model.email ?? null;
        this.mobile= model.mobile ?? null;
        this.enterpriseUid= model.enterpriseUid ?? null;
        this.password= model.password ?? null;
        this.passwordUpdatedAt= model.passwordUpdatedAt ?? null;
        this.authority= model.authority ?? null;
        this.enabled= model.enabled ?? true;
        this.createdAt= model.createdAt ?? new Date();
        this.createdBy= model.createdBy ?? null;
        this.updatedAt= model.updatedAt ?? null;
        this.updatedBy= model.updatedBy ?? null;
        this.deleted= model.deleted ?? 0;
        this.deletedAt= model.deletedAt ?? null;
        this.deletedBy= model.deletedBy ?? null;
    }
}

module.exports = UsersModel;
```

## 建立連線與Transaction
- 可使用的function:
    - insert
    - update
    - markDeleted
    - delete
```javascript
const conn = await userModel.getConnection();
conn.beginTransaction();

await userModel.insert({})

try {
    conn.commit();
} catch (error) {
    conn.rollback();
} finally {
    conn.release();
}
```

## find & findOne
- 根據條件搜尋
```javascript
await usersModel.find(
    {
        enterpriseUid // 查詢條件
    }
);
```

- 篩選特定欄位
```javascript
await usersModel.find({},
    {
        params: ['uid', 'enterpriseUid'], // 所需欄位
    }
);
```

- LEFT JOIN外部資料表
```javascript
await usersModel.find({},
    {
        includes: [ // left join資料表
            {
                table: new model.EnterpriseModel(), // 該資料表model instance
                params: ['uid', 'name'], // 所需欄位
            },
            {
                table: new model.OptionsModel(),
                alias: 'department', // 資料表別名
                params: ['uid', 'name'], // 所需欄位
            },
        ]
    }
);
```

- 模糊比對
```javascript
await usersModel.find({},
    {
        like: [ // 模糊比對
          {
            param: 'type', // 欄位名稱
            value: 'admin', // 欄位值
          },
        ]
    }
);
```

- 是否以model建立instance
```javascript
await usersModel.find({},
    {
        createByModel: true, // 是否以model建立instance
    }
);
```

- SQL WHERE IN
```javascript
await usersModel.find({},
    {
        contains: [ // WHERE uid IN ('uid1', 'uid2')
          {
            param: 'uid', // 欄位名稱
            value: ['uid1', 'uid2'] // 欄位值
          },
        ],
    }
);
```

- 大於、小於、大於等於、小於等於
    - gte: 大於等於
    - lte: 小於等於
    - gt: 大於
    - lt: 小於
```javascript
await usersModel.find({},
    {
        gte: [ //大於等於
            {
                param: 'createAt', // 欄位名稱
                value: '20220601' // 欄位值
            }
        ]
    }
);
```

- Paranoid (是否為軟刪除)
```javascript
await userModel.find({}, {
    paranoid: false
});

// [{ ..., deleted: true }]
```

## insert
- 新增單筆或多筆資料
```javascript
await userModel.insert({
    uid,
    name,
    ...
});
```

## update
- 更新資料
```javascript
await userModel.update({
    name // 更新欄位值
}, {
    condition: {
        userUid // 查詢條件
    },
    updatedBy // 更新者uid
})
```

## markDeleted
- 標示為已刪除
```javascript
await userModel.markDeleted({
    uid // 查詢條件
}, {
    deletedBy // 標記刪除者uid
})
```

## delete
實際刪除DB資料
```javascript
await userModel.delete({
    uid
})
```