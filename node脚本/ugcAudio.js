const utils = {
  // date格式化为字符串
  dateToString(date, format = 'YYYY-MM-DD hh-mm-ss') {
    const fullYear = date.getFullYear();
    const year = date.getYear();
    const month = utils.upNumberToString(date.getMonth() + 1);
    const day = utils.upNumberToString(date.getDate());
    const hours = utils.upNumberToString(date.getHours());
    const minutes = utils.upNumberToString(date.getMinutes());
    const seconds = utils.upNumberToString(date.getSeconds());
    return format.replace('YYYY', fullYear).replace('yyyy', fullYear)
        .replace('yy', year)
        .replace('YY', year)
        .replace('MM', month)
        .replace('dd', day)
        .replace('DD', day)
        .replace('hh', hours)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
        .replace('SS', seconds);
  },
  // 小于10的数字补全为2位数
  upNumberToString(number) {
    if (number < 10) {
      return `0${number}`;
    }
    return String(number);
  },
  // 权限角色
  ugcAudioAuth: (() => {
    const subPermission = userInfo.sub_permission[84] || [];
    return {
      manager: subPermission.includes('manager'),
      quality: subPermission.includes('quality'),
      quality_high: subPermission.includes('quality_high'),
      operate: subPermission.includes('operate'),
      log: subPermission.includes('log'),
    };
  })(),
  // 校验k歌uid（外网登录）
  checkOutsideLogin() {
    if (userInfo.uid || userInfo.userid) {
      return true;
    }
    dtd.resolve({ code: -99, subcode: 0, message: '找不到k歌uid', default: 0, data: { userInfo } });
    return false;
  },
  // 获取ugc音视频 推荐 数据库连接
  getKgSaveAllConnection() {
    const connection = mysql.createConnection({
      host: '100.65.202.29',
      port: '4168',
      database: 'k_new',
      password: 'plat_service_3',
      user: 'plat_service_3',
    });
    connection.connect();
    return connection;
  },
  // 获取ugc音视频 审核 数据库连接
  getKgNewConnection() {
    const connection = mysql.createConnection({
      host: '100.65.202.29',
      port: '4168',
      database: 'k_new',
      password: 'plat_service_3',
      user: 'plat_service_3',
    });
    connection.on('error', (error) => {
      dtd.resolve({
        code: 0,
        subcode: -1,
        message: '数据库连接报错，请重试',
        data: { error },
      });
    });
    connection.connect();
    return connection;
  },
  // ugc数据详情 中间表
  getUgcDataDetailConnection() {
    const connection = mysql.createConnection({
      host: '11.185.189.40',
      port: '3306',
      database: 'k_ugc_data_detail',
      password: 'fe_update_detail',
      user: 'fe_update_detail',
    });
    connection.connect();
    return connection;
  },
  // 新推荐表
  getUgcRecommendConnection() {
    const connection = mysql.createConnection({
      host: '11.185.189.210',
      port: '3306',
      database: 'kg_safe_all',
      password: 'ugc_recommend_fe',
      user: 'ugc_recommend_fe',
    });
    connection.connect();
    return connection;
  },
  // 获取中间表表明（日期分表）
  getUgcDataDetailTableName(ugc_id) {
    const dateStamp = Number(ugc_id.split('_')[1]) || 0;
    let date;

    if (dateStamp < 1612800000) {
      return ''
    }
    date = this.dateToString(new Date(dateStamp * 1000), 'YYYYMMDD');
    return `t_k_ugc_data_detail_${date}_copy1`;
  }
};

const MEDIA_UGCAUDIO_SOURCE = [
  { name: '朗诵达人', key: 'isrecitetalent' },
  { name: '赛事选手（年度盛典）', key: 'isannual' },
  { name: '赛事选手（星歌声）', key: 'isstarplayer' },
  { name: '音频达人', key: 'isaudiotalent' },
  { name: '赛事选手（星途）', key: 'isstarroad' },
  { name: '内部账号', key: 'isinner' },
  { name: '短视频达人', key: 'isvideotalent' },
  { name: '视频MCN', key: 'isvideomcn' },
  { name: '签约艺人（全约）', key: 'issign' },
  { name: '签约艺人（唱片约）', key: 'issigncd' },
  { name: '外站明星', key: 'isoutsidestar' },
  { name: '抖音授权分发', key: 'istitok' },
  { name: '蓝V', key: 'isblue' },
  { name: '红V', key: 'isred' },
  { name: '黄V', key: 'isyellow' },
  { name: '高级白名单', key: 'ishighwhiteuser' },
  { name: '潜在视频达人', key: 'ispotentialvideo' },
  { name: '潜在音频达人', key: 'ispotentialaudio' },
  { name: '签约主播', key: 'isanchor' },
  { name: '抖音搬运假账号', key: 'istitokfake' },
];

// 操作类型（视频：0-短视频，1-MV视频，2-音频）,部分语句因为优化没有用这个变量
const PRD_TYPE = 2;

const MAX_TASK_NUMBER = 5; // 最大同时领任务数
const MAX_TASK_TIME_MIN = 5; // 领任务超时时间：5min
const MAX_TASK_TIME = MAX_TASK_TIME_MIN * 60 * 1000; // 领任务超时时间：5min

// 媒资数据库
const MEDIA_MAP = {
  getMediaConnection() {
    const connection = mysql.createConnection({
      host: '100.65.202.29',
      port: '4168',
      database: 'db_kg_kube_list',
      password: 'plat_service_3',
      user: 'plat_service_3',
    });
    connection.connect();
    return connection;
  },
  // ugc增改操作日志
  async addUgcOperationLog(logParams = {}) {
    const connection = this.getMediaConnection();
    const values = [
      `'${logParams.t_source || 'ugcAudio'}'`,
      `'${logParams.t_time || utils.dateToString(new Date(), 'YYYY-MM-DD hh:mm:ss')}'`,
      `'${logParams.t_user || userInfo.uid || userInfo.userid}'`,
      `'${logParams.t_operation || params.action || ''}'`,
      `'${logParams.t_key}'`,
      `'${JSON.stringify(logParams.t_value_before || '').replace(/'/g, '\\\'')}'`,
      `'${JSON.stringify(logParams.t_value_after || '').replace(/'/g, '\\\'')}'`,
      `'${JSON.stringify(logParams.t_sql || '').replace(/'/g, '\\\'')}'`,
      `'${JSON.stringify(logParams.t_params || JSON.stringify(params)).replace(/'/g, '\\\'')}'`,
      logParams.hasOwnProperty('t_result') ? logParams.t_result : 1,
    ];
    const insertSql = `insert into t_media_system_operation_logs (t_source,t_time,t_user,t_operation,t_key,t_value_before,t_value_after,t_sql,t_params,t_result) values (${values.join(',')});`;
    const result = { success: false, result: null, error: null, insertSql };
    try {
      result.result = await new Promise((resolve, reject) => {
        connection.query(insertSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
      result.success = true;
    } catch (e) {
      result.error = e;
    }
    connection.end();
    return result;
  },
  // ugc增改操作日志：自动查询更改后的值
  async addUgcOperationLogAutoAfter(_params = {}) {
    const newConnection = utils.getKgNewConnection();
    const connection = utils.getKgSaveAllConnection();
    try {
      const logParams = { ..._params };
      if (!logParams.t_value_after) {
        const selectInfoSql = `select * from qmkg_videorec_media_content_info where ugcid='${_params.t_key}';`;
        const selectPoolSql = `select * from t_qmkg_rec_2019_pool where prd_id='${_params.t_key}';`;
        const _logInfoUgc = await new Promise((resolve, reject) => {
          newConnection.query(selectInfoSql, (error, res) => {
            error ? resolve({ error, selectInfoSql }) : resolve(res[0]);
          });
        });
        const _logPoolUgc = await new Promise((resolve, reject) => {
          connection.query(selectPoolSql, (error, res) => {
            error ? resolve({ error, selectPoolSql }) : resolve(res.length ? res[0] : {});
          });
        });
        logParams.t_value_after = {
          qmkg_videorec_media_content_info: _logInfoUgc,
          t_qmkg_rec_2019_pool: _logPoolUgc,
        };
      }
      this.addUgcOperationLog(logParams).catch(() => {
      });
    } catch (e) {
    } finally {
      connection.end();
      newConnection.end();
    }
  },
  // 媒资长时间任务记录：插入
  async addMediaLongTimeTask(taskParams = {}) {
    const connection = taskParams.connection || this.getMediaConnection();
    const values = [
      `'${taskParams.t_key}'`,
      `'${taskParams.t_params}'`,
    ];
    const insertSql = `insert into t_media_system_longtime_tasks (t_key,t_params) values (${values.join(',')});`;
    const result = { success: true, result: null, error: null, insertSql };
    try {
      result.result = await new Promise((resolve, reject) => {
        connection.query(insertSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      result.success = false;
      result.error = e;
    }
    // 外部传的connection由外部关闭
    !taskParams.connection && connection.end();
    return result;
  },
  // 媒资长时间任务记录：更新
  async updateMediaLongTimeTask(taskParams = {}) {
    const connection = taskParams.connection || this.getMediaConnection();
    const values = [];
    taskParams.t_result && values.push(`t_result='${(taskParams.t_result || '').replace(/'/g, '\\\'')}'`);
    taskParams.t_stage && values.push(`t_stage=${taskParams.t_stage}`);
    taskParams.t_progress && values.push(`t_progress=${taskParams.t_progress}`);

    const updateSql = `update t_media_system_longtime_tasks set ${values.join(',')} where t_key='${taskParams.t_key}';`;
    const result = { success: true, result: null, error: null, updateSql };
    try {
      result.result = await new Promise((resolve, reject) => {
        connection.query(updateSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      result.success = false;
      result.error = e;
    }
    // 外部传的connection由外部关闭
    !taskParams.connection && connection.end();
    return result;
  },
  // 媒资长时间任务记录：查询
  async selectMediaLongTimeTask(taskParams = {}) {
    const connection = taskParams.connection || this.getMediaConnection();
    const selectSql = `select t_key,t_progress,t_stage,t_result from t_media_system_longtime_tasks where t_key='${taskParams.t_key}';`;
    const result = { success: true, result: null, error: null, selectSql };
    try {
      result.result = await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      result.success = false;
      result.error = e;
    }
    // 外部传的connection由外部关闭
    !taskParams.connection && connection.end();
    return result;
  },
  // 媒资数据记录：查询
  async selectMediaRecord(params = {}) {
    const connection = params.connection || this.getMediaConnection();
    const selectSql = `select * from t_media_system_record where \`key\`='${params.key}';`;
    const result = { success: true, result: null, error: null, selectSql };
    try {
      result.result = await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          error || res.length < 1 ? reject(error) : resolve(res[0]);
        });
      });
    } catch (e) {
      result.success = false;
      result.error = e;
    }
    // 外部传的connection由外部关闭
    !params.connection && connection.end();
    return result;
  },
  // 媒资数据记录：更新
  async updateMediaRecord(params = {}) {
    const connection = params.connection || this.getMediaConnection();
    const values = [];
    params.value && values.push(`value='${(params.value).replace(/'/g, '\\\'')}'`);
    params.status && values.push(`status=${params.status}`);
    params.update_user && values.push(`update_user='${params.update_user}'`);

    const updateSql = `update t_media_system_record set ${values.join(',')} where \`key\`='${params.key}';`;
    const result = { success: true, result: null, error: null, updateSql };
    try {
      result.result = await new Promise((resolve, reject) => {
        connection.query(updateSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      result.success = false;
      result.error = e;
    }
    // 外部传的connection由外部关闭
    !params.connection && connection.end();
    return result;
  },
  // 媒资数据记录：查询任务领取
  async selectMediaRecordTask(params = {}) {
    const connection = params.connection || this.getMediaConnection();
    const selectSql = `select * from t_media_system_record where \`key\`='${params.key}';`;
    const result = { success: false, result: null, error: null, selectSql };
    try {
      result.result = await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          if (error || res.length < 1) {
            reject(error);
          } else {
            const recordValue = JSON.parse(res[0].value || '{}');
            const recordTask = recordValue.tasks || [];
            const nowTime = new Date().getTime();
            const _result = {};
            _result.tasks = recordTask.filter(_t => (nowTime - new Date(_t.time).getTime()) <= MAX_TASK_TIME);
            resolve(_result);
          }
        });
      });
      result.success = true;
    } catch (e) {
      result.success = false;
      result.error = e;
    }
    // 外部传的connection由外部关闭
    !params.connection && connection.end();
    return result;
  },
  // 媒资数据记录：添加任务领取
  async addMediaRecordTask(params = {}) {
    const selectSql = `select * from t_media_system_record where \`key\`='${params.key}';`;
    const result = { success: false, result: null, error: null, selectSql };
    const connection = params.connection || this.getMediaConnection();
    try {
      await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          if (error || res.length < 1) {
            reject(error);
          } else {
            try {
              const recordValue = JSON.parse(res[0].value || '{}');
              recordValue.tasks = recordValue.tasks || [];
              const nowTime = new Date().getTime();
              recordValue.tasks.push({
                user: params.user,
                time: nowTime,
              });
              const updateSql = `update t_media_system_record set value='${JSON.stringify(recordValue)}' where \`key\`='${params.key}';`;
              result.updateSql = updateSql;
              connection.query(updateSql, (error, res) => {
                error ? reject(error) : resolve(res);
              });
            } catch (e) {
              reject(e);
            }
          }
        });
      });
      result.success = true;
    } catch (e) {
      result.success = false;
      result.error = e;
    }
    // 外部传的connection由外部关闭
    !params.connection && connection.end();
    return result;
  },
  // 媒资数据记录：删除任务领取
  async deleteMediaRecordTask(params = {}) {
    const selectSql = `select * from t_media_system_record where \`key\`='${params.key}';`;
    const result = { success: false, result: null, error: null, selectSql };
    const connection = params.connection || this.getMediaConnection();
    try {
      await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          if (error || res.length < 1) {
            reject(error);
          } else {
            const recordValue = JSON.parse(res[0].value || '{}');
            const recordTask = recordValue.tasks || [];
            const nowTime = new Date().getTime();
            recordValue.tasks = recordTask.filter(_t => (nowTime - new Date(_t.time).getTime()) <= MAX_TASK_TIME && _t.user !== params.user);
            const updateSql = `update t_media_system_record set value='${JSON.stringify(recordValue)}' where \`key\`='${params.key}';`;
            result.updateSql = updateSql;
            connection.query(updateSql, (error, res) => {
              error ? reject(error) : resolve(res);
            });
          }
        });
      });
      result.success = true;
    } catch (e) {
      result.success = false;
      result.error = e;
    }
    // 外部传的connection由外部关闭
    !params.connection && connection.end();
    return result;
  },
  // ugc增改操作日志：查询
  async getUgcOperationLog() {
    let whereSql = ['t_source=\'ugcAudio\''];
    params.t_time && params.t_time.length && whereSql.push(`t_time between '${params.t_time[0]}' and '${params.t_time[1]}'`);
    params.t_user && params.t_user.length && whereSql.push(`t_user in ('${params.t_user.join('\',\'')}')`);
    params.t_operation && params.t_operation.length && whereSql.push(`t_operation in ('${params.t_operation.join('\',\'')}')`);
    params.t_key && params.t_key.length && whereSql.push(`t_key in ('${params.t_key.join('\',\'')}')`);
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = size * page;
    let listData = null;
    let total = 0;
    whereSql = whereSql.length ? `where ${whereSql.join(' and ')}` : '';
    const selectSql = `select * from t_media_system_operation_logs ${whereSql} ORDER BY id DESC limit ${startIndex},${size};`;
    const countSql = `select count(*) as num from t_media_system_operation_logs ${whereSql};`;
    const sql = { whereSql, selectSql, countSql };
    const connection = MEDIA_MAP.getMediaConnection();
    // 分页查询
    try {
      listData = await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      dtd.resolve({ code: -1, subcode: 0, message: '查询数据失败', default: 0, data: { error: e, ...sql } });
      connection.end();
      return;
    }
    // 计算总数
    try {
      total = await new Promise((resolve, reject) => {
        connection.query(countSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      dtd.resolve({ code: -1, subcode: 0, message: '获取总数失败', default: 0, data: { error: e, ...sql } });
      connection.end();
      return;
    }
    dtd.resolve({
      code: 0,
      subcode: 0,
      message: '查询成功',
      data: { list: listData, total, ...sql },
    });
    connection.end();
  },
  // 同步数据到中间表： 更新
  async updateUgcDataDetailTask(params = {}) {
    const connection = utils.getUgcDataDetailConnection();
    const infoValues = params.infoValues || []
    const tableName = utils.getUgcDataDetailTableName(params.ugcid)
    let updateSql;
    const result = { success: true, result: null, error: null, updateSql };
    infoValues.push(`Fre_write_status=${params.write_status || 1}`); // 回写状态 1-质检；2-打标
    if (tableName) {
      updateSql = `update ${tableName} set ${infoValues.join(',')} where Fugc_id='${params.ugcid}';`
      try {
        result.result = await new Promise((resolve, reject) => {
          connection.query(updateSql, (error, res) => {
            error ? reject({ error, type: 'updateUgcDataDetail', updateSql }) : resolve(res);
          });
        });
      } catch (error) {
        result.success = false;
        result.error = error;
      }
    }
    connection.end();
    return result;
  },
  // 根据ugc数据同步中间表 - 批量导入质检/打标结果
  async updateUgcDataDetailByInfo(params = {}) {
    const ugc = params.ugc || {}
    const type = params.type || ''
    const user = userInfo.uid || userInfo.userid;
    const time = utils.dateToString(new Date());
    let infoValues

    if (type === 'batchQualityImport') {
      const updateField = [];
      const { ugcid, w_quality_user, re_check_user, w_is_young, w_is_music, w_quality, is_restrict,
        w_restrict_reason, w_quality_reason } = ugc;
      let _status = params.w_status || 0;
      if (params.isRecheck) {
        updateField.push(`Fre_check_user='${re_check_user}'`);
        updateField.push(`Fre_check_time='${time}'`);
        updateField.push('Fw_is_return=2');
        updateField.push(`Fis_restrict=${is_restrict || 0}`);
        updateField.push(`Fw_restrict_reason=${w_restrict_reason || 0}`);
      } else {
        _status = [0, 3].includes(_status) ? 1 : _status;
        w_quality === 1 && (_status = 3);
        updateField.push(`Fw_status=${_status}`);
        updateField.push(`Fw_quality_user='${w_quality_user}'`);
        updateField.push(`Fw_quality_time='${time}'`);
      }
      infoValues = [
        `Fuid=${ugcid.split('_')[0]}`,
        // `Fpubtime=${ugcid.split('_')[1]}`,
        `Fw_is_young='${w_is_young}'`,
        `Fw_is_music=${w_is_music}`,
        `Fw_quality='${w_quality}'`,
        `Fw_s_update_user='${user}'`,
        `Fw_s_update_time='${time}'`,
        `Fw_quality_reason=${w_quality_reason}`,
        ...updateField,
      ];
      this.updateUgcDataDetailTask({
        infoValues,
        ugcid
      })
    } else if (type === 'batchTagImport') {
      const { ugcid, w_tager, main_timbre, sub_timbre, main_timbre_score, sub_timbre_score } = ugc
      let Ftimbre_tag_result = '';
      infoValues = [
        'Fw_status=2',
        `Fw_tager='${w_tager}'`,
        // `main_timbre='${main_timbre}'`,
        // `sub_timbre='${sub_timbre}'`,
        // `main_timbre_score=${main_timbre_score}`,
        // `sub_timbre_score=${sub_timbre_score}`,
        `Fw_tag_time='${time}'`,
        `Fw_s_update_user='${user}'`,
        `Fw_s_update_time='${time}'`,
      ];
      Ftimbre_tag_result += JSON.stringify({
        tag1: main_timbre,
        prob1: main_timbre_score
      })
      Ftimbre_tag_result += '|'
      Ftimbre_tag_result += JSON.stringify({
        tag2: sub_timbre,
        prob2: sub_timbre_score
      })
      infoValues.push(`Ftimbre_tag_result='${Ftimbre_tag_result}'`)
      this.updateUgcDataDetailTask({
        infoValues,
        ugcid,
        write_status: 2
      })
    }
  }
};

// ugc音频管理
const UGC_AUDIO_MAP = {
  // 获取ugc音频质量原因列表
  async getUgcAudioQualityReason() {
    const RECORD_KEY = 'getUgcAudioQualityReason';
    const recordSelect = await MEDIA_MAP.selectMediaRecord({ key: RECORD_KEY });
    if (!(recordSelect && recordSelect.success)) {
      dtd.resolve({
        code: 0,
        subcode: -1,
        message: '查询质量原因异步记录失败',
        data: { recordSelect },
      });
      return;
    }
    const data = JSON.parse(recordSelect.result.value || JSON.stringify({ list: [] }));
    dtd.resolve({
      code: 0,
      subcode: 0,
      message: '查询成功',
      default: 0,
      data,
    });
    // 数据过时更新
    const RECORD_TIMEOUT = 18 * 60 * 60 * 1000; // 数据过时：18小时
    const nowTime = new Date().getTime();
    const oldTime = new Date(recordSelect.result.update_time).getTime();
    if (recordSelect.result.status === 0 && (nowTime - oldTime) > RECORD_TIMEOUT) {
      try {
        await MEDIA_MAP.updateMediaRecord({ key: RECORD_KEY, status: 1 });
        const connection = utils.getKgNewConnection();
        const selectSql = `select distinct w_quality_reason from qmkg_videorec_media_content_info where prd_type = ${PRD_TYPE};`;
        let listData = null;
        listData = await new Promise((resolve, reject) => {
          connection.query(selectSql, (error, res) => {
            error ? reject(error) : resolve(res);
          });
        });
        connection.end();
        listData && await MEDIA_MAP.updateMediaRecord({
          key: RECORD_KEY,
          status: 0,
          value: JSON.stringify({ list: listData }),
        });
      } catch (e) {

      }
    }
  },
  // 获取ugc音频状态
  async getUgcAudioStatus() {
    // const connection = utils.getKgSaveAllConnection();
    // const selectSql = `select distinct status from qmkg_videorec_media_content_info where prd_type in
    // (${PRD_TYPE.join(',')});`;
    try {
      // todo
      /*      const listData = await new Promise((resolve, reject) => {
              connection.query(selectSql, function (error, res) {
                error ? reject(error) : resolve(res);
              });
            });*/
      const listData = [{ status: -1 }, { status: 0 }];
      dtd.resolve({ code: 0, subcode: 0, message: '查询成功', default: 0, data: { list: listData } });
    } catch (e) {
      dtd.resolve({ code: -1, subcode: 0, message: '查询作品状态失败', default: 0, data: { error: e } });
    }
    // connection.end();
  },
  // 查询ugc音频作品
  async getUgcAudio() {
    const connection = utils.getKgNewConnection();
    // 查询条件
    let whereSql = [`prd_type = ${PRD_TYPE}`];
    params.filterValue.length && params.filterKey !== 'ugcid' && whereSql.push(`${params.filterKey} in (${params.filterValue.join(',')})`);
    params.filterValue.length && params.filterKey === 'ugcid' && whereSql.push(`${params.filterKey} in ('${params.filterValue.join('\',\'')}')`);
    params.filterUgcStatus && params.filterUgcStatus.length && whereSql.push(`status in (${params.filterUgcStatus.join(',')})`);
    params.filterIsReturn && whereSql.push(`w_is_return in (${params.filterIsReturn})`);
    params.filterStatus && whereSql.push(`w_status in (${params.filterStatus})`);
    if (params.filterQualityUser) {
      const _filterQualityUser = params.filterQualityUser.split(/\s+|,/).map(v => v.trim())
          .filter(v => !!v);
      if (_filterQualityUser.length === 1) {
        whereSql.push(`w_quality_user like '${_filterQualityUser[0]}%'`);
      } else if (_filterQualityUser.length > 1) {
        whereSql.push(`w_quality_user in ('${_filterQualityUser.join('\',\'')}')`);
      }
    }
    params.filterQualityTime && params.filterQualityTime.length && whereSql.push(`w_quality_time between '${params.filterQualityTime[0]}' and '${params.filterQualityTime[1]}'`);
    if (params.filterRecheckUser) {
      const filterRecheckUser = params.filterRecheckUser.split(/\s+|,/).map(v => v.trim())
          .filter(v => !!v);
      if (filterRecheckUser.length === 1) {
        whereSql.push(`re_check_user like '${filterRecheckUser[0]}%'`);
      } else if (filterRecheckUser.length > 1) {
        whereSql.push(`re_check_user in ('${filterRecheckUser.join('\',\'')}')`);
      }
    }
    params.filterRecheckTime && params.filterRecheckTime.length && whereSql.push(`re_check_time between '${params.filterRecheckTime[0]}' and '${params.filterRecheckTime[1]}'`);
    if (params.filterSource.length) {
      const source2 = params.filterSource.map((_s) => {
        const _sourceItem = MEDIA_UGCAUDIO_SOURCE.find(v => v.name === _s);
        return _sourceItem ? _sourceItem.key : _s;
      });
      whereSql.push(`(w_source in ('${params.filterSource.join('\',\'')}') or (w_source is null and top_user_type in ('${source2.join('\',\'')}')))`);
    }
    params.filterTagTime && params.filterTagTime.length && whereSql.push(`w_tag_time between '${params.filterTagTime[0]}' and '${params.filterTagTime[1]}'`);

    if (params.filterTager) {
      const _filterTager = params.filterTager.split(/\s+|,/).map(v => v.trim())
          .filter(v => !!v);
      if (_filterTager.length === 1) {
        whereSql.push(`w_tager like '${_filterTager[0]}%'`);
      } else if (_filterTager.length > 1) {
        whereSql.push(`w_tager in ('${_filterTager.join('\',\'')}')`);
      }
    }

    // params.filterScheme && params.filterScheme && whereSql.push(`scheme_id = ${params.filterScheme}`);
    params.filterScheme && params.filterScheme && whereSql.push(`top_user_type = '${params.filterScheme}'`);
    params.filterPriority && whereSql.push(`priority = ${params.filterPriority}`);
    params.filterIsYoung.length && whereSql.push(`w_is_young in ("${params.filterIsYoung.join('","')}")`);
    params.filterIsMusic.length && whereSql.push(`w_is_music in (${params.filterIsMusic.join(',')})`);
    params.filterQuality.length && whereSql.push(`w_quality in (${params.filterQuality.join(',')})`);
    params.filterQualityReason && params.filterQualityReason.length && whereSql.push(`w_quality_reason in ('${params.filterQualityReason.join('\',\'')}')`);

    whereSql = whereSql.length ? `where ${whereSql.join(' and ')}` : '';
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = size * page;
    let listData = null;
    let total = 0;
    const selectSql = `select * from qmkg_videorec_media_content_info ${whereSql} limit ${startIndex},${size};`;
    const countSql = `select count(*) as num from qmkg_videorec_media_content_info ${whereSql};`;
    const sql = { whereSql, selectSql, countSql };
    // 分页查询
    try {
      listData = await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      dtd.resolve({ code: -1, subcode: 0, message: '查询数据失败', default: 0, data: { error: e, ...sql } });
      connection.end();
      return;
    }
    // 计算总数
    try {
      total = await new Promise((resolve, reject) => {
        connection.query(countSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      dtd.resolve({ code: -1, subcode: 0, message: '获取总数失败', default: 0, data: { error: e, ...sql } });
      connection.end();
      return;
    }

    dtd.resolve({
      code: 0,
      subcode: 0,
      message: '查询成功',
      default: 0,
      data: {
        list: listData,
        total,
        ...sql,
      },
    });

    connection.end();
  },
  // 上传ugc音频作品（v2）
  async addUgcAudioV2() {
    if (!(utils.ugcAudioAuth.manager || utils.ugcAudioAuth.operate)) {
      dtd.resolve({ code: -1, subcode: 0, message: '无权限', default: 0, data: { userInfo } });
      return;
    }
    const connection = utils.getKgNewConnection();
    const ugcList = params.list;
    const result = { success: [], error: [], error_break: '' };
    const user = userInfo.uid || userInfo.userid;
    const time = utils.dateToString(new Date());
    const selectSql = ({ ugcid }) => `select ugcid from qmkg_videorec_media_content_info where ugcid='${ugcid}';`;
    const updateSql = ({ ugcid, priority, source, w_quality_user }) => {
      const updateData = [
        `uid=${ugcid.split('_')[0]}`,
        `pubtime=${ugcid.split('_')[1]}`,
        `priority=${priority}`,
        `w_s_update_user='${user}'`,
        `w_s_update_time='${time}'`,
      ];
      source && updateData.push(`w_source='${source}'`);
      w_quality_user && updateData.push(`w_quality_user='${w_quality_user}'`);
      return `update qmkg_videorec_media_content_info set ${updateData.join(',')} where ugcid='${ugcid}';`;
    };
    const insertSql = ({ ugcid, priority, source, /* scheme_id,*/ top_user_type, w_quality_user }) => {
      const columnName = [
        'ugcid',
        'uid',
        'pubtime',
        'prd_type',
        'status',
        'priority',
        'w_s_create_user',
        'w_s_create_time',
      ];
      const columnValue = [
        `'${ugcid}'`,
        `${ugcid.split('_')[0]}`,
        `${ugcid.split('_')[1]}`,
        '2',
        '0',
        `${priority}`,
        `'${user}'`,
        `'${time}'`,
      ];
      if (source) {
        columnName.push('w_source');
        columnValue.push(`'${source}'`);
      }
      // if (scheme_id) {
      //   columnName.push('scheme_id');
      //   columnValue.push(`'${scheme_id}'`);
      // }
      if (top_user_type) {
        columnName.push('top_user_type');
        columnValue.push(`'${top_user_type}'`);
      }
      if (w_quality_user) {
        columnName.push('w_quality_user');
        columnValue.push(`'${w_quality_user}'`);
      }
      return `INSERT INTO qmkg_videorec_media_content_info (${columnName.join(',')}) VALUES (${columnValue.join(',')});`;
    };
    // 记录任务
    const mediaConnection = await MEDIA_MAP.getMediaConnection();
    const t_key = `${user}_${utils.dateToString(new Date(), 'YYYYMMDDhhmmss')}`;
    let taskResult;
    taskResult = await MEDIA_MAP.addMediaLongTimeTask({
      connection: mediaConnection,
      t_key,
      t_params: JSON.stringify(ugcList),
    });
    if (!taskResult.success) {
      dtd.resolve({ code: -1, subcode: 0, message: '任务记录失败', data: taskResult });
      connection.end();
      mediaConnection.end();
      return;
    }
    // 循环添加
    dtd.resolve({ code: 0, subcode: 0, message: '开始操作，请轮询查询结果', data: { t_key } });
    const MAX_ERROR = 100; // 最大错误数量，超出以后自动终止任务
    const UPDATE_PROGRESS_NUMBER = 500;  // 每执行完多少条任务，更新一下数据中的任务进度
    let taskCount = 0; // 任务序号
    const _logNowTime = utils.dateToString(new Date(), 'YYYY-MM-DD hh:mm:ss');
    for (const ugc of ugcList) {
      taskCount += 1;
      const _selectSql = selectSql(ugc);
      let _logSql;
      let _logValueBefore;
      try {
        const res = await new Promise((resolve, reject) => {
          connection.query(_selectSql, (err1, row1) => {
            if (err1) {
              // 查询ugcid错误
              reject({ type: 'select', sql: _selectSql, detail: err1 });
            } else if (row1.length) {
              // 查询ugcid有值，更新数据
              const _updateSql = updateSql(ugc);
              _logSql = _updateSql;
              _logValueBefore = row1[0];
              connection.query(_updateSql, (err2, row2) => {
                err2
                    ? reject({ type: 'update', sql: _updateSql, detail: err2 })
                    : resolve({ type: 'update', result: row2 });
              });
            } else {
              // 查询ugcid无值，插入数据
              const _insertSql = insertSql(ugc);
              _logSql = _insertSql;
              connection.query(_insertSql, (err3, row3) => {
                err3
                    ? reject({ type: 'insert', sql: _insertSql, detail: err3 })
                    : resolve({ type: 'insert', result: row3 });
              });
            }
          });
        });
        // 操作日志
        MEDIA_MAP.addUgcOperationLog({
          t_time: _logNowTime,
          t_key: ugc.ugcid,
          t_sql: _logSql,
          t_params: ugc,
          t_value_before: _logValueBefore || {},
        }).catch(() => {
        });
        // 减少带宽，成功就不记录了
        // result.success.push({data: ugc, ...res});
      } catch (e) {
        result.error.push({ data: ugc, error: e });
      }
      // 每 UPDATE_PROGRESS_NUMBER 条任务，记录进度
      if (taskCount % UPDATE_PROGRESS_NUMBER === 0) {
        try {
          await MEDIA_MAP.updateMediaLongTimeTask({
            connection: mediaConnection,
            t_key,
            t_progress: Math.floor(taskCount * 100 / ugcList.length),
          });
        } catch (e) {
        }
      }
      // 超出最大错误数以后自动终止任务
      if (result.error.length >= MAX_ERROR) {
        result.error_break = `错误数超过${MAX_ERROR}，自动终止任务`;
        break;
      }
    }

    taskResult = await MEDIA_MAP.updateMediaLongTimeTask({
      connection: mediaConnection,
      t_key,
      t_result: JSON.stringify(result),
      t_stage: result.error.length ? 2 : 1,
      t_progress: Math.floor(taskCount * 100 / ugcList.length),
    });
    connection.end();
    mediaConnection.end();
  },
  // 领取ugc音频质检任务
  async getUgcAudioQuality() {
    if (!(utils.ugcAudioAuth.manager || utils.ugcAudioAuth.quality_high || utils.ugcAudioAuth.quality)) {
      dtd.resolve({ code: -1, subcode: 0, message: '无权限', default: 0, data: { userInfo } });
      return;
    }
    const RECORD_KEY = 'getUgcAudioQuality';
    const connection = utils.getKgNewConnection();
    // const MAX_TASK = 100; // 最大任务数
    const { scheme, taskNum, isRecheck } = params;
    const user = userInfo.uid || userInfo.userid;
    let selectSql = `select * from qmkg_videorec_media_content_info where w_quality_user='${user}' and w_status=0 and status = 0 and prd_type = ${PRD_TYPE} and top_user_type = '${scheme}' ORDER BY convert(ai_score, decimal(10,4)) DESC limit ${taskNum};`;
    const prioritySql = [
      'convert(ai_score, decimal(10,4)) DESC',
    ];
    const orderSql = ` ORDER BY ${prioritySql.join(' , ')} `;
    let taskSql = limit => `select ugcid from qmkg_videorec_media_content_info where w_quality_user IS NULL and status = 0 and w_status=0 and prd_type =2 and top_user_type = '${scheme}' ${orderSql} limit ${limit};`;
    let updateSql = ugcids => `update qmkg_videorec_media_content_info set w_quality_user='${user}' where ugcid in ('${ugcids.join('\',\'')}') and w_quality_user IS NULL;`;

    if (isRecheck) {
      // 复审特殊逻辑
      selectSql = `select * from qmkg_videorec_media_content_info where re_check_user='${user}' AND w_is_return = 1 and prd_type = ${PRD_TYPE} and top_user_type = '${scheme}' ORDER BY convert(ai_score, decimal(10,4)) DESC limit ${taskNum};`;
      taskSql = limit => `select ugcid from qmkg_videorec_media_content_info where re_check_user IS NULL and w_is_return = 1 and prd_type =2 and top_user_type = '${scheme}' ${orderSql} limit ${limit};`;
      updateSql = ugcids => `update qmkg_videorec_media_content_info set re_check_user='${user}' where ugcid in ('${ugcids.join('\',\'')}') and re_check_user IS NULL;`;
    }

    try {
      // 获取已有的未质检任务
      let result = await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          error ? reject({ error, type: 'select1', selectSql }) : resolve(res);
        });
      });
      let ugcids = [];
      // 任务数不足
      if (result.length < taskNum && !params.showOnly) {
        // 领取任务限制
        const recordSelect = await MEDIA_MAP.selectMediaRecordTask({ key: RECORD_KEY });
        if (!(recordSelect && recordSelect.success)) {
          dtd.resolve({ code: -1, subcode: 0, message: '异步查询任务失败', recordSelect });
          connection.end();
          return;
        }
        const recordTasks = recordSelect.result.tasks;
        if (recordTasks.length >= MAX_TASK_NUMBER) {
          dtd.resolve({
            code: -1,
            subcode: 0,
            message: `超过${MAX_TASK_NUMBER}人正在领取任务，请稍候：${recordTasks.map(v => v.user).join(',')}`,
            recordSelect,
          });
          connection.end();
          return;
        } if (recordTasks.some(v => v.user === user)) {
          const _task = recordTasks.find(v => v.user === user);
          dtd.resolve({
            code: -1,
            subcode: 0,
            message: `已于【${utils.dateToString(new Date(_task.time))}】领取了任务，请等待任务完成，或等待${MAX_TASK_TIME_MIN}分钟后重新开始`,
            recordSelect,
          });
          connection.end();
          return;
        }
        // 超时关闭:无法使用setTimeout
        /* outTime = setTimeout(function () {
          !params.showOnly && MEDIA_MAP.deleteMediaRecordTask({key: RECORD_KEY, user: user}).catch(() => {
          });
          dtd.resolve({"code": -1, "subcode": 0, "message": "超时中断任务"});
          connection.end();
        }, MAX_TASK_TIME);*/
        await MEDIA_MAP.addMediaRecordTask({ key: RECORD_KEY, user });
        // 获取新任务
        const _taskSql = taskSql(taskNum - result.length);
        const newTask = await new Promise((resolve, reject) => {
          connection.query(_taskSql, (error, res) => {
            error ? reject({ error, type: 'getNewTask', _taskSql }) : resolve(res);
          });
        });
        // 设置新任务的质检人
        ugcids = newTask.map(v => v.ugcid);
        const _updateSql = updateSql(ugcids);
        await new Promise((resolve, reject) => {
          connection.query(_updateSql, (error, res) => {
            error ? reject({ error, type: 'update', _updateSql }) : resolve(res);
          });
        });
        // 操作日志
        MEDIA_MAP.addUgcOperationLog({
          t_key: '',
          t_sql: _updateSql,
        }).catch(() => {
        });
        // 重新获取未质检任务
        result = await new Promise((resolve, reject) => {
          connection.query(selectSql, (error, res) => {
            error ? reject({ error, type: 'select2', selectSql }) : resolve(res);
          });
        });
        // outTime && clearTimeout(outTime);
        MEDIA_MAP.deleteMediaRecordTask({ key: RECORD_KEY, user }).catch(() => {
        });
      }
      dtd.resolve({
        code: 0,
        subcode: 0,
        message: '获取质检任务成功',
        data: { list: result, newTask: ugcids },
      });
      connection.end();
    } catch (e) {
      !params.showOnly && MEDIA_MAP.deleteMediaRecordTask({ key: RECORD_KEY, user }).catch(() => {
      });
      dtd.resolve({ code: -1, subcode: 0, message: '获取质检任务失败', default: 0, data: e });
      connection.end();
    }
  },
  // 设置ugc音频质检
  async updateUgcAudioQuality() {
    if (!(utils.ugcAudioAuth.manager || utils.ugcAudioAuth.quality_high || utils.ugcAudioAuth.quality)) {
      dtd.resolve({ code: -1, subcode: 0, message: '无权限', default: 0, data: { userInfo } });
      return;
    }
    const connection = utils.getKgNewConnection();
    // 新推荐表
    const recConn = utils.getUgcRecommendConnection();
    const result = {};
    const user = userInfo.uid || userInfo.userid;
    const time = utils.dateToString(new Date());
    let _ugc;
    let _logPoolUgc;
    let _logInfoSql;
    let _logPoolSql;
    // 权限校验
    const selectInfoSql = `select * from qmkg_videorec_media_content_info where ugcid='${params.ugcid}';`;
    try {
      _ugc = await new Promise((resolve, reject) => {
        connection.query(selectInfoSql, (error, res) => {
          error ? reject({ error, type: 'selectInfo', selectInfoSql }) : resolve(res[0]);
        });
      });
      if (!(utils.ugcAudioAuth.manager || utils.ugcAudioAuth.quality_high || _ugc.w_quality_user == user)) {
        dtd.resolve({ code: -1, subcode: 0, message: '无权限修改他人作品', default: 0, data: { userInfo, _ugc } });
        connection.end();
        return;
      }
      if (_ugc.w_quality === 3 && parseInt(params.w_quality) !== 3 && !utils.ugcAudioAuth.manager) {
        dtd.resolve({
          code: -1,
          subcode: 0,
          message: '作品原为高质，只有管理员才可改成非高质！',
          data: { _ugc, result, auth: utils.ugcAudioAuth },
        });
        connection.end();
        return;
      }
    } catch (error) {
      dtd.resolve({
        code: -1,
        subcode: 0,
        message: '查询作品失败，请重试！',
        default: 0,
        data: { error },
      });
      connection.end();
      return;
    }
    // 更新发布池表
    const poolUpdateValues = [
      `fname='${user}'`,
      `is_young=${params.w_is_young === '1,2' || params.w_is_young === '1,2,3,4' ? 1 : 0}`,
      `is_music=${params.w_is_music}`,
      `quality=${params.w_quality ? params.w_quality : null}`,
      `is_restrict=${params.is_restrict ? params.is_restrict : 0}`,
    ];
    const poolInsertValues = [
      `'${params.ugcid}'`,
      `${params.pubtime}`,
      '2',
      `'${user}'`,
      '\'\'',
      `${params.w_is_young === '1,2' || params.w_is_young === '1,2,3,4' ? 1 : 0}`,
      params.w_is_music,
      params.w_quality ? params.w_quality : null,
      params.is_restrict ? params.is_restrict : 0,
      _ugc.ai_score,
      params.ugc_mask ? `'${params.ugc_mask}'` : '""',
      params.ugc_mask_ext ? `'${params.ugc_mask_ext}'` : '""',
    ];
    const selectPoolSql = `select * from t_qmkg_rec_2019_pool where prd_id='${params.ugcid}';`;
    const updatePoolSql = `update t_qmkg_rec_2019_pool set ${poolUpdateValues.join(',')} where prd_id='${params.ugcid}';`;
    const insertPoolSql = `insert into t_qmkg_rec_2019_pool (prd_id,pubtime,prd_type,fname,ftags,is_young,is_music,quality,is_restrict,ai_score,ugc_mask,ugc_mask_ext) VALUES (${poolInsertValues.join(',')});`;

    const recomConnection = utils.getKgSaveAllConnection();
    try {
      // 查找ugcid是否存在
      const selectUgc = await new Promise((resolve, reject) => {
        recomConnection.query(selectPoolSql, (error, res) => {
          error ? reject({ error, type: 'selectPool', selectPoolSql }) : resolve(res);
        });
      });
      _logPoolUgc = selectUgc;
      if (selectUgc.length) {
        // ugcid存在
        _logPoolSql = updatePoolSql;
        result.updatePool = await new Promise((resolve, reject) => {
          recomConnection.query(updatePoolSql, (error, res) => {
            error ? reject({ error, type: 'updatePool', updatePoolSql }) : resolve(res);
          });
        });
        // 新推荐表
        result.updateNewPool = await new Promise((resolve, reject) => {
          recConn.query(updatePoolSql, (error, res) => {
            error ? reject({ error, type: 'updatePool', updatePoolSql }) : resolve(res);
          });
        });
      } else if (parseInt(params.w_quality) > 1) {
        // ugcid不存在且非低质量
        _logPoolSql = insertPoolSql;
        result.insertPool = await new Promise((resolve, reject) => {
          recomConnection.query(insertPoolSql, (error, res) => {
            error ? reject({ error, type: 'insertPool', insertPoolSql }) : resolve(res);
          });
        });
        // 新推荐表
        result.insertNewPool = await new Promise((resolve, reject) => {
          recConn.query(insertPoolSql, (error, res) => {
            error ? reject({ error, type: 'insertPool', insertPoolSql }) : resolve(res);
          });
        });

        // 不阻塞主流程
        // WEBAPP_MAP.reportSafe().catch(() => {});
        result.reportResult = await new Promise(async (resolve) => {
          const result = await WEBAPP_MAP.reportSafe();
          if (result.success) {
            resolve({ reportSafe: result.result });
          } else {
            resolve({ reportSafe: result.result, error: result.error });
          }
        });
      }
    } catch (error) {
      dtd.resolve({ code: -1, subcode: 0, message: '更新质检信息失败', default: 0, data: { result, error } });
      recomConnection.end();
      return;
    } finally {
      recomConnection.end();
    }
    // 更新信息表
    const infoValues = [
      `w_status=${params.w_status}`,
      `w_is_young='${params.w_is_young}'`,
      `w_is_music=${params.w_is_music}`,
      `w_quality=${params.w_quality ? params.w_quality : null}`,
      `w_quality_reason=${params.w_quality_reason ? params.w_quality_reason : null}`,
      `w_s_update_user='${user}'`,
      `w_s_update_time='${time}'`,
      `is_restrict=${params.is_restrict ? params.is_restrict : 0}`,
      `w_restrict_reason=${params.w_restrict_reason ? params.w_restrict_reason : 0}`,
    ];
    if (params.isRecheck) {
      infoValues.push(`re_check_user='${user}'`);
      infoValues.push(`re_check_time='${time}'`);
      infoValues.push('w_is_return=2');
    } else {
      infoValues.push(`w_quality_user='${user}'`);
      infoValues.push(`w_quality_time='${time}'`);
    }
    const updateInfoSql = `update qmkg_videorec_media_content_info set ${infoValues.join(',')} where ugcid='${params.ugcid}';`;
    try {
      _logInfoSql = updateInfoSql;
      result.updateInfo = await new Promise((resolve, reject) => {
        connection.query(updateInfoSql, (error, res) => {
          error ? reject({ error, type: 'updateInfo', updateInfoSql }) : resolve(res);
        });
      });
    } catch (error) {
      dtd.resolve({
        code: -1,
        subcode: 0,
        message: '更新【发布表】成功但更新【信息表】失败，请重试！',
        default: 0,
        data: { result, error },
      });
      connection.end();
      return;
    }
    /* 同步中间表 - begin */
    const infoValues2 = [
      `Fw_status=${params.w_status}`,
      `Fw_is_young='${params.w_is_young}'`,
      `Fw_is_music=${params.w_is_music}`,
      `Fw_quality=${params.w_quality ? params.w_quality : null}`,
      `Fw_quality_reason=${params.w_quality_reason ? params.w_quality_reason : null}`,
      `Fw_s_update_user='${user}'`,
      `Fw_s_update_time='${time}'`,
      `Fis_restrict=${params.is_restrict ? params.is_restrict : 0}`,
      `Fw_restrict_reason=${params.w_restrict_reason ? params.w_restrict_reason : 0}`,
    ];
    MEDIA_MAP.updateUgcDataDetailTask({
      infoValues: infoValues2,
      ugcid: params.ugcid
    })
    /* 同步中间表 - end */
    // 操作日志
    MEDIA_MAP.addUgcOperationLogAutoAfter({
      t_key: params.ugcid,
      t_value_before: {
        qmkg_videorec_media_content_info: _ugc,
        t_qmkg_rec_2019_pool: _logPoolUgc.length ? _logPoolUgc[0] : {},
      },
      t_sql: {
        qmkg_videorec_media_content_info: _logInfoSql,
        t_qmkg_rec_2019_pool: _logPoolSql || '',
      },
    }).catch(() => {
    });
    dtd.resolve({ code: 0, subcode: 0, message: '质检成功', default: 0, data: result });
    connection.end();
  },
  // 批量导入质检结果v2
  async updateUgcAudioQualityResultV2() {
    if (!(utils.ugcAudioAuth.manager)) {
      dtd.resolve({ code: -1, subcode: 0, message: '无权限', default: 0, data: { userInfo } });
      return;
    }
    const connection = utils.getKgSaveAllConnection();
    // 新推荐表
    const recConn = utils.getUgcRecommendConnection();
    const { isRecheck, list: ugcList } = params;
    const result = { success: [], error: [] };
    const user = userInfo.uid || userInfo.userid;
    const time = utils.dateToString(new Date());
    // 信息表
    const selectInfoSql = ({ ugcid }) => `select w_status from qmkg_videorec_media_content_info where ugcid='${ugcid}';`;
    const updateInfoSql = (
        { ugcid, w_quality_user, re_check_user, w_is_young, w_is_music, w_quality, is_restrict,
          w_restrict_reason, w_quality_reason },
        w_status,
    ) => {
      const updateField = [];
      let _status = w_status;
      if (isRecheck) {
        updateField.push(`re_check_user='${re_check_user}'`);
        updateField.push(`re_check_time='${time}'`);
        updateField.push('w_is_return=2');
        updateField.push(`is_restrict=${is_restrict || 0}`);
        updateField.push(`w_restrict_reason=${w_restrict_reason || 0}`);
      } else {
        _status = [0, 3].includes(w_status) ? 1 : w_status;
        w_quality === 1 && (_status = 3);
        updateField.push(`w_status=${_status}`);
        updateField.push(`w_quality_user='${w_quality_user}'`);
        updateField.push(`w_quality_time='${time}'`);
      }
      const updateData = [
        `uid=${ugcid.split('_')[0]}`,
        `pubtime=${ugcid.split('_')[1]}`,
        `w_is_young='${w_is_young}'`,
        `w_is_music=${w_is_music}`,
        `w_quality='${w_quality}'`,
        `w_s_update_user='${user}'`,
        `w_s_update_time='${time}'`,
        `w_quality_reason=${w_quality_reason}`,
        ...updateField,
      ];
      return `update qmkg_videorec_media_content_info set ${updateData.join(',')} where ugcid='${ugcid}';`;
    };
    const insertInfoSql = ({ ugcid, w_quality_user, re_check_user, w_is_young, w_is_music, w_quality,
                             w_quality_reason, is_restrict, w_restrict_reason }) => {
      const _status = w_quality === 1 ? 3 : 1;
      const columnName = [
        'ugcid',
        'uid',
        'pubtime',
        'prd_type',
        'status',
        'w_status',
        'w_is_young',
        'w_is_music',
        'w_quality',
        'w_quality_reason',
        'w_s_create_user',
        'w_s_create_time',
      ];
      const columnValue = [
        `'${ugcid}'`,
        `${ugcid.split('_')[0]}`,
        `${ugcid.split('_')[1]}`,
        '2',
        '0',
        `${_status}`,
        `'${w_is_young}'`,
        `${w_is_music}`,
        `${w_quality}`,
        `'${w_quality_reason ? w_quality_reason : 0}'`,
        `'${user}'`,
        `'${time}'`,
      ];
      if (isRecheck) {
        columnName.push('w_is_return');
        columnName.push('re_check_user');
        columnName.push('re_check_time');
        columnName.push('is_restrict');
        columnName.push('w_restrict_reason');
        columnValue.push('2');
        columnValue.push(`'${re_check_user}'`);
        columnValue.push(`'${time}'`);
        columnValue.push(is_restrict);
        columnValue.push(w_restrict_reason ? w_restrict_reason : 0);
      } else {
        columnName.push('w_quality_user');
        columnName.push('w_quality_time');
        columnValue.push(`'${w_quality_user}'`);
        columnValue.push(`'${time}'`);
      }

      return `INSERT INTO qmkg_videorec_media_content_info (${columnName.join(',')}) VALUES (${columnValue.join(',')});`;
    };
    // 发布表
    const selectPoolSql = ({ ugcid }) => `select prd_id from t_qmkg_rec_2019_pool where prd_id='${ugcid}';`;
    const updatePoolSql = ({ ugcid, w_quality_user, w_is_young, w_is_music, w_quality, is_restrict }) => {
      const updateData = [
        `fname='${w_quality_user}'`,
        `is_young=${w_is_young === '1,2' || w_is_young === '1,2,3,4' ? 1 : 0}`,
        `is_music=${w_is_music}`,
        `quality=${w_quality}`,
        `is_restrict=${is_restrict || 0}`,
      ];
      return `update t_qmkg_rec_2019_pool set ${updateData.join(',')} where prd_id='${ugcid}';`;
    };
    const insertPoolSql = ({ ugcid, w_quality_user, w_is_young, w_is_music, w_quality, is_restrict }) => {
      const columnName = [
        'prd_id',
        'pubtime',
        'prd_type',
        'fname',
        'is_young',
        'is_music',
        'quality',
        'is_restrict',
      ];
      const columnValue = [
        `'${ugcid}'`,
        `${ugcid.split('_')[1]}`,
        '2',
        `'${w_quality_user}'`,
        `${w_is_young === '1,2' || w_is_young === '1,2,3,4' ? 1 : 0}`,
        `${w_is_music}`,
        `${w_quality}`,
        is_restrict || 0,
      ];
      return `INSERT INTO t_qmkg_rec_2019_pool (${columnName.join(',')}) VALUES (${columnValue.join(',')});`;
    };
    // 记录任务
    const mediaConnection = await MEDIA_MAP.getMediaConnection();
    const t_key = `${user}_${utils.dateToString(new Date(), 'YYYYMMDDhhmmss')}`;
    let taskResult;
    taskResult = await MEDIA_MAP.addMediaLongTimeTask({
      connection: mediaConnection,
      t_key,
      t_params: JSON.stringify(ugcList),
    });
    if (!taskResult.success) {
      dtd.resolve({ code: -1, subcode: 0, message: '任务记录失败', data: taskResult });
      connection.end();
      mediaConnection.end();
      return;
    }
    // 循环添加
    dtd.resolve({ code: 0, subcode: 0, message: '开始操作，请轮询查询结果', data: { t_key } });
    const MAX_ERROR = 100; // 最大错误数量，超出以后自动终止任务
    const UPDATE_PROGRESS_NUMBER = 500;  // 每执行完多少条任务，更新一下数据中的任务进度
    let taskCount = 0; // 任务序号
    const _logNowTime = utils.dateToString(new Date(), 'YYYY-MM-DD hh:mm:ss');
    const newConnection = utils.getKgNewConnection();

    for (const ugc of ugcList) {
      taskCount += 1;
      let _logInfoSql;
      let _logPoolSql;
      let _logInfoValue;
      let _logPoolValue;
      try {
        // 发布表
        const _selectPoolSql = selectPoolSql(ugc);
        // 查找ugcid是否存在
        const selectPoolUgc = await new Promise((resolve, reject) => {
          connection.query(_selectPoolSql, (error, res) => {
            error ? reject({ error, type: 'selectPool', _selectPoolSql }) : resolve(res);
          });
        });
        if (selectPoolUgc.length) {
          // ugcid存在
          const _updatePoolSql = updatePoolSql(ugc);
          _logPoolSql = _updatePoolSql;
          _logPoolValue = selectPoolUgc[0];
          // await new Promise((resolve, reject) => {
          //   connection.query(_updatePoolSql, (error, res) => {
          //     error ? reject({ error, type: 'updatePool', _updatePoolSql }) : resolve(res);
          //   });
          // });
          await Promise.all([
            new Promise((resolve, reject) => {
              connection.query(_updatePoolSql, (error, res) => {
                error ? reject({ error, type: 'updatePool', _updatePoolSql }) : resolve(res);
              });
            }),
            // 新推荐表
            new Promise((resolve, reject) => {
              recConn.query(_updatePoolSql, (error, res) => {
                error ? reject({ error, type: 'updatePool', _updatePoolSql }) : resolve(res);
              });
            })
          ])
        } else if (parseInt(ugc.w_quality, 10) > 1) {
          // ugcid不存在且非低质量
          const _insertPoolSql = insertPoolSql(ugc);
          _logPoolSql = _insertPoolSql;
          // await new Promise((resolve, reject) => {
          //   connection.query(_insertPoolSql, (error, res) => {
          //     error ? reject({ error, type: 'insertPool', _insertPoolSql }) : resolve(res);
          //   });
          // });
          await Promise.all([
            new Promise((resolve, reject) => {
              connection.query(_insertPoolSql, (error, res) => {
                error ? reject({ error, type: 'insertPool', _insertPoolSql }) : resolve(res);
              });
            }),
            // 新推荐表
            new Promise((resolve, reject) => {
              recConn.query(_insertPoolSql, (error, res) => {
                error ? reject({ error, type: 'insertPool', _insertPoolSql }) : resolve(res);
              });
            })
          ])
        }
        // 信息表
        let currentStatus = 0
        await new Promise((resolve, reject) => {
          const _selectInfoSql = selectInfoSql(ugc);
          newConnection.query(_selectInfoSql, (err1, row1) => {
            if (err1) {
              // 查询ugcid错误
              reject({ type: 'selectInfo', sql: _selectInfoSql, detail: err1 });
            } else if (row1.length) {
              // 查询ugcid有值，更新数据
              const _updateInfoSql = updateInfoSql(ugc, row1[0].w_status);
              currentStatus = row1[0].w_status;
              _logInfoSql = _updateInfoSql;
              _logInfoValue = row1[0];
              newConnection.query(_updateInfoSql, (err2, row2) => {
                err2
                    ? reject({ type: 'updateInfo', sql: _updateInfoSql, detail: err2 })
                    : resolve({ type: 'updateInfo', result: row2 });
              });
            } else {
              // 查询ugcid无值，插入数据
              const _insertInfoSql = insertInfoSql(ugc);
              _logInfoSql = _insertInfoSql;
              newConnection.query(_insertInfoSql, (err3, row3) => {
                err3
                    ? reject({ type: 'insertInfo', sql: _insertInfoSql, detail: err3 })
                    : resolve({ type: 'insertInfo', result: row3 });
              });
            }
          });
        });
        /* 同步中间表 - begin */
        MEDIA_MAP.updateUgcDataDetailByInfo({
          ugc,
          w_status: currentStatus,
          type: 'batchQualityImport',
          isRecheck
        })
        /* 同步中间表 - end */
        // 操作日志
        MEDIA_MAP.addUgcOperationLogAutoAfter({
          t_key: ugc.ugcid,
          t_time: _logNowTime,
          t_value_before: {
            qmkg_videorec_media_content_info: _logInfoValue || {},
            t_qmkg_rec_2019_pool: _logPoolValue || {},
          },
          t_sql: {
            qmkg_videorec_media_content_info: _logInfoSql || '',
            t_qmkg_rec_2019_pool: _logPoolSql || '',
          },
          t_params: ugc,
        }).catch(() => {
        });
        // result.success.push(ugc.ugcid);
      } catch (e) {
        result.error.push({ data: ugc, error: e });
      }
      // 每 UPDATE_PROGRESS_NUMBER 条任务，记录进度
      if (taskCount % UPDATE_PROGRESS_NUMBER === 0) {
        try {
          await MEDIA_MAP.updateMediaLongTimeTask({
            connection: mediaConnection,
            t_key,
            t_progress: Math.floor(taskCount * 100 / ugcList.length),
          });
        } catch (e) {
        }
      }
      // 超出最大错误数以后自动终止任务
      if (result.error.length >= MAX_ERROR) {
        result.error_break = `错误数超过${MAX_ERROR}，自动终止任务`;
        break;
      }
    }

    taskResult = await MEDIA_MAP.updateMediaLongTimeTask({
      connection: mediaConnection,
      t_key,
      t_result: JSON.stringify(result),
      t_stage: result.error.length ? 2 : 1,
      t_progress: Math.floor(taskCount * 100 / ugcList.length),
    });
    connection.end();
    mediaConnection.end();
    newConnection.end();
  },
  // 领取ugc音频打标任务
  async getUgcAudioTag() {
    if (!(utils.ugcAudioAuth.manager || utils.ugcAudioAuth.tager_high || utils.ugcAudioAuth.tager)) {
      dtd.resolve({ code: -1, subcode: 0, message: '无权限', default: 0, data: { userInfo } });
      return;
    }
    const connection = utils.getKgNewConnection();
    const taskNum = 50;
    const user = userInfo.uid || userInfo.userid;
    const beginDate = utils.dateToString(new Date(Date.now() - 2 * 24 * 3600 * 1000), 'YYYY-MM-DD')
    const selectSql = `select * from qmkg_videorec_media_content_info where w_tager='${user}' and w_status=1 and status = 0 and prd_type = ${PRD_TYPE} ORDER BY convert(ai_score, decimal(10,4)) DESC limit ${taskNum};`;

    const taskSql = [
      limit => `select ugcid from qmkg_videorec_media_content_info where w_tager IS NULL and w_status=1 and status = 0 and prd_type = 2 and w_quality = 3 and w_s_create_time > '${beginDate}' ORDER BY w_s_create_time DESC, convert(ai_score, decimal(10,4)) DESC limit ${limit};`,
      limit => `select ugcid from qmkg_videorec_media_content_info where w_tager IS NULL and w_status=1 and status = 0 and prd_type = 2 and w_quality = 3 ORDER BY w_s_create_time DESC, convert(ai_score, decimal(10,4)) DESC limit ${limit};`,
    ];
    const updateSql = ugcids => `update qmkg_videorec_media_content_info set w_tager='${user}' where ugcid in ('${ugcids.join('\',\'')}') and w_tager is null;`;
    try {
      // 获取已有的未打标任务
      let result = await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          error ? reject({ error, type: 'select1', selectSql }) : resolve(res);
        });
      });
      let ugcids = [];
      // 任务数不足
      if (result.length < taskNum && !params.showOnly) {
        let userTaskLength = result.length;
        // 拆分排序为简单查询
        for (let _i = 0; _i < taskSql.length; _i++) {
          // 获取新任务
          const _taskSql = taskSql[_i](taskNum - userTaskLength);
          const newTask = await new Promise((resolve, reject) => {
            connection.query(_taskSql, (error, res) => {
              error ? reject({ error, type: `getNewTask${_i}`, _taskSql }) : resolve(res);
            });
          });
          // 设置新任务的打标人
          ugcids = newTask.map(v => v.ugcid);
          const _updateSql = updateSql(ugcids);
          await new Promise((resolve, reject) => {
            connection.query(_updateSql, (error, res) => {
              error ? reject({ error, type: `update${_i}`, _updateSql }) : resolve(res);
            });
          });
          userTaskLength += newTask.length;
          if (userTaskLength >= taskNum) {
            break;
          }
        }
        // 重新获取未打标任务
        result = await new Promise((resolve, reject) => {
          connection.query(selectSql, (error, res) => {
            error ? reject({ error, type: 'select2', selectSql }) : resolve(res);
          });
        });
      }
      dtd.resolve({
        code: 0,
        subcode: 0,
        message: '获取打标任务成功',
        default: 0,
        data: { list: result, newTask: ugcids },
      });
      connection.end();
    } catch (e) {
      dtd.resolve({ code: -1, subcode: 0, message: '获取打标任务失败', default: 0, data: e });
      connection.end();
    }
  },
  // 设置ugc音频打标
  async updateUgcAudioTag() {
    if (!(utils.ugcAudioAuth.manager || utils.ugcAudioAuth.tager_high || utils.ugcAudioAuth.tager)) {
      dtd.resolve({ code: -1, subcode: 0, message: '无权限', default: 0, data: { userInfo } });
      return;
    }
    const connection = utils.getKgSaveAllConnection();
    const newConnection = utils.getKgNewConnection();
    // 新推荐表
    const recConn = utils.getUgcRecommendConnection();
    const result = {};
    const user = userInfo.uid || userInfo.userid;
    const time = utils.dateToString(new Date());
    // 权限校验
    const selectInfoSql = `select * from qmkg_videorec_media_content_info where ugcid='${params.ugcid}';`;
    let _ugc;
    let _logInfoSql;
    try {
      _ugc = await new Promise((resolve, reject) => {
        newConnection.query(selectInfoSql, (error, res) => {
          error ? reject({ error, type: 'selectInfo', selectInfoSql }) : resolve(res[0]);
        });
      });
      if (!(utils.ugcAudioAuth.manager || utils.ugcAudioAuth.tager_high || _ugc.w_tager === user)) {
        dtd.resolve({ code: -1, subcode: 0, message: '无权限修改他人作品', default: 0, data: { userInfo, _ugc } });
        connection.end();
        newConnection.end();
        return;
      }
    } catch (error) {
      dtd.resolve({
        code: -1,
        subcode: 0,
        message: '查询作品失败，请重试！',
        default: 0,
        data: { error },
      });
      connection.end();
      newConnection.end();
      return;
    }

    // 更新发布池表
    let _logPoolUgc;
    let _logPoolSql;
    const poolValues = [
      `main_timbre='${params.main_timbre}'`,
      `sub_timbre='${params.sub_timbre}'`,
      `main_timbre_score=${params.main_timbre_score}`,
      `sub_timbre_score=${params.sub_timbre_score}`,
    ];
    const selectPoolSql = `select * from t_qmkg_rec_2019_pool where prd_id='${params.ugcid}';`;
    const updatePoolSql = `update t_qmkg_rec_2019_pool set ${poolValues.join(',')} where prd_id='${params.ugcid}';`;
    try {
      _logPoolUgc = await new Promise((resolve, reject) => {
        connection.query(selectPoolSql, (error, res) => {
          error ? reject({ error, type: 'selectPool', selectPoolSql }) : resolve(res);
        });
      });
      _logPoolSql = updatePoolSql;
      result.updatePool = await new Promise((resolve, reject) => {
        connection.query(updatePoolSql, (error, res) => {
          error ? reject({ error, type: 'updatePool', updatePoolSql }) : resolve(res);
        });
      });
      // 新推荐表
      result.updateNewPool = await new Promise((resolve, reject) => {
        recConn.query(updatePoolSql, (error, res) => {
          error ? reject({ error, type: 'updatePool', updatePoolSql }) : resolve(res);
        });
      });
    } catch (error) {
      dtd.resolve({ code: -1, subcode: 0, message: '更新打标信息失败', default: 0, data: { result, error } });
      connection.end();
      newConnection.end();
      return;
    }

    // 更新信息表
    const infoValues = [
      'w_status=2',
      `main_timbre='${params.main_timbre}'`,
      `sub_timbre='${params.sub_timbre}'`,
      `main_timbre_score='${params.main_timbre_score}'`,
      `sub_timbre_score='${params.sub_timbre_score}'`,
      `w_tager='${user}'`,
      `w_tag_time='${time}'`,
      `w_s_update_user='${user}'`,
      `w_s_update_time='${time}'`,
    ];
    const updateInfoSql = `update qmkg_videorec_media_content_info set ${infoValues.join(',')} where ugcid='${params.ugcid}';`;
    try {
      _logInfoSql = updateInfoSql;
      result.updateInfo = await new Promise((resolve, reject) => {
        newConnection.query(updateInfoSql, (error, res) => {
          error ? reject({ error, type: 'updateInfo', updateInfoSql }) : resolve(res);
        });
      });
    } catch (error) {
      dtd.resolve({
        code: -1,
        subcode: 0,
        message: '更新【信息表】失败，请重试！',
        default: 0,
        data: { result, error },
      });
      connection.end();
      newConnection.end();
      return;
    }
    /* 同步中间表 - begin */
    const infoValues2 = [
      'Fw_status=2',
      // `main_timbre='${params.main_timbre}'`,
      // `sub_timbre='${params.sub_timbre}'`,
      // `main_timbre_score='${params.main_timbre_score}'`,
      // `sub_timbre_score='${params.sub_timbre_score}'`,
      `Fw_tager='${user}'`,
      `Fw_tag_time='${time}'`,
      `Fw_s_update_user='${user}'`,
      `Fw_s_update_time='${time}'`,
    ];
    let Ftimbre_tag_result = ''
    Ftimbre_tag_result += JSON.stringify({
      tag1: params.main_timbre,
      prob1: params.main_timbre_score
    })
    Ftimbre_tag_result += '|'
    Ftimbre_tag_result += JSON.stringify({
      tag2: params.sub_timbre,
      prob2: params.sub_timbre_score
    })
    infoValues2.push(`Ftimbre_tag_result='${Ftimbre_tag_result}'`)
    MEDIA_MAP.updateUgcDataDetailTask({
      infoValues: infoValues2,
      ugcid: params.ugcid,
      write_status: 2
    })
    /* 同步中间表 - end */
    MEDIA_MAP.addUgcOperationLogAutoAfter({
      t_key: params.ugcid,
      t_value_before: {
        qmkg_videorec_media_content_info: _ugc,
        t_qmkg_rec_2019_pool: _logPoolUgc.length ? _logPoolUgc[0] : {},
      },
      t_sql: {
        qmkg_videorec_media_content_info: _logInfoSql,
        t_qmkg_rec_2019_pool: _logPoolSql,
      },
    }).catch(() => {});
    dtd.resolve({ code: 0, subcode: 0, message: '打标成功', default: 0, data: result });
    connection.end();
    newConnection.end();
  },
  // 批量导入打标结果V2
  async updateUgcAudioTagResultV2() {
    if (!(utils.ugcAudioAuth.manager)) {
      dtd.resolve({ code: -1, subcode: 0, message: '无权限', default: 0, data: { userInfo } });
      return;
    }
    const connection = utils.getKgSaveAllConnection();
    const newConnection = utils.getKgNewConnection();
    // 新推荐表
    const recConn = utils.getUgcRecommendConnection();
    const ugcList = params.list;
    const result = { success: [], error: [] };
    const user = userInfo.uid || userInfo.userid;
    const time = utils.dateToString(new Date());
    // 信息表
    const selectInfoSql = ({ ugcid }) => `select w_status from qmkg_videorec_media_content_info where ugcid='${ugcid}';`;
    const updateInfoSql = ({ ugcid, w_tager, main_timbre, sub_timbre, main_timbre_score, sub_timbre_score }) => {
      const updateData = [
        'w_status=2',
        `w_tager='${w_tager}'`,
        `main_timbre='${main_timbre}'`,
        `sub_timbre='${sub_timbre}'`,
        `main_timbre_score=${main_timbre_score}`,
        `sub_timbre_score=${sub_timbre_score}`,
        `w_tag_time='${time}'`,
        `w_s_update_user='${user}'`,
        `w_s_update_time='${time}'`,
      ];
      return `update qmkg_videorec_media_content_info set ${updateData.join(',')} where ugcid='${ugcid}';`;
    };
    // 发布表
    const selectPoolSql = ({ ugcid }) => `select prd_id from t_qmkg_rec_2019_pool where prd_id='${ugcid}';`;
    const updatePoolSql = ({ ugcid, main_timbre, sub_timbre, main_timbre_score, sub_timbre_score }) => {
      const updateData = [
        `main_timbre='${main_timbre}'`,
        `sub_timbre='${sub_timbre}'`,
        `main_timbre_score=${main_timbre_score}`,
        `sub_timbre_score=${sub_timbre_score}`,
      ];
      return `update t_qmkg_rec_2019_pool set ${updateData.join(',')} where prd_id='${ugcid}';`;
    };
    // 记录任务
    const mediaConnection = await MEDIA_MAP.getMediaConnection();
    const t_key = `${user}_batch_audio_tag_${utils.dateToString(new Date(), 'YYYYMMDDhhmmss')}`;
    let taskResult;
    taskResult = await MEDIA_MAP.addMediaLongTimeTask({
      connection: mediaConnection,
      t_key,
      t_params: JSON.stringify(ugcList),
    });
    if (!taskResult.success) {
      dtd.resolve({ code: -1, subcode: 0, message: '任务记录失败', data: taskResult });
      connection.end();
      mediaConnection.end();
      newConnection.end();
      return;
    }
    // 循环添加
    dtd.resolve({ code: 0, subcode: 0, message: '开始操作，请轮询查询结果', data: { t_key } });
    const MAX_ERROR = 100; // 最大错误数量，超出以后自动终止任务
    const UPDATE_PROGRESS_NUMBER = 100;  // 每执行完多少条任务，更新一下数据中的任务进度
    let taskCount = 0; // 任务序号
    for (const ugc of ugcList) {
      taskCount += 1;
      try {
        // 信息表
        await new Promise((resolve, reject) => {
          const _selectInfoSql = selectInfoSql(ugc);
          newConnection.query(_selectInfoSql, (err1, row1) => {
            if (err1) {
              // 查询ugcid错误
              reject({ type: 'selectInfo', sql: _selectInfoSql, detail: err1, msg: '查询ugcid错误' });
            } else if (row1.length && ![1, 2].includes(row1[0].w_status)) {
              // 作品状态不是【待打标】或【已打标】
              reject({ type: 'ugcInfo', sql: _selectInfoSql, detail: row1, msg: '作品状态不是【待打标】或【已打标】' });
            } else if (row1.length) {
              // 更新值
              const _updateInfoSql = updateInfoSql(ugc);
              newConnection.query(_updateInfoSql, (err2, row2) => {
                err2
                    ? reject({ type: 'updateInfo', sql: _updateInfoSql, detail: err2, msg: '更新作品出错' })
                    : resolve({ type: 'updateInfo', result: row2 });
              });
              /* 同步中间表 - begin */
              MEDIA_MAP.updateUgcDataDetailByInfo({
                ugc,
                type: 'batchTagImport'
              })
              /* 同步中间表 - end */
            } else {
              // 查询ugcid无值，插入数据
              reject({ type: 'selectInfo', sql: _selectInfoSql, detail: err1, msg: '无此ugcid' });
            }
          });
        });
        // 发布表
        const _selectPoolSql = selectPoolSql(ugc);
        // 查找ugcid是否存在
        const selectPoolUgc = await new Promise((resolve, reject) => {
          connection.query(_selectPoolSql, (error, res) => {
            error ? reject({ error, type: 'selectPool', _selectPoolSql, msg: '查询发布表作品出错' }) : resolve(res);
          });
        });
        if (selectPoolUgc.length) {
          // ugcid存在
          const _updatePoolSql = updatePoolSql(ugc);
          // await new Promise((resolve, reject) => {
          //   connection.query(_updatePoolSql, (error, res) => {
          //     error ? reject({ error, type: 'updatePool', _updatePoolSql, msg: '更新发布表作品出错' }) : resolve(res);
          //   });
          // });
          await Promise.all([
            new Promise((resolve, reject) => {
              connection.query(_updatePoolSql, (error, res) => {
                error ? reject({ error, type: 'updatePool', _updatePoolSql, msg: '更新发布表作品出错' }) : resolve(res);
              });
            }),
            // 新推荐表
            new Promise((resolve, reject) => {
              recConn.query(_updatePoolSql, (error, res) => {
                error ? reject({ error, type: 'updatePool', _updatePoolSql, msg: '更新发布表作品出错' }) : resolve(res);
              });
            })
          ])
        } else {
          // ugcid不存在
          result.error.push({
            data: ugc,
            error: { type: 'selectPool', sql: _selectPoolSql, detail: selectPoolUgc, msg: '发布表无此ugcid' },
          });
          continue;
        }
        // result.success.push(ugc.ugcid);
      } catch (e) {
        result.error.push({ data: ugc, error: e });
      }
      // 每 UPDATE_PROGRESS_NUMBER 条任务，记录进度
      if (taskCount % UPDATE_PROGRESS_NUMBER === 0) {
        try {
          await MEDIA_MAP.updateMediaLongTimeTask({
            connection: mediaConnection,
            t_key,
            t_progress: Math.floor(taskCount * 100 / ugcList.length),
          });
        } catch (e) {
        }
      }
      // 超出最大错误数以后自动终止任务
      if (result.error.length >= MAX_ERROR) {
        result.error_break = `错误数超过${MAX_ERROR}，自动终止任务`;
        break;
      }
    }

    taskResult = await MEDIA_MAP.updateMediaLongTimeTask({
      connection: mediaConnection,
      t_key,
      t_result: JSON.stringify(result),
      t_stage: result.error.length ? 2 : 1,
      t_progress: Math.floor(taskCount * 100 / ugcList.length),
    });
    connection.end();
    mediaConnection.end();
    newConnection.end();
  },
  // 数据统计
  async analyzeUgcAudio() {
    if (!(utils.ugcAudioAuth.manager)) {
      dtd.resolve({ code: -1, subcode: 0, message: '无权限', default: 0, data: { userInfo } });
      return;
    }
    const result = {
      qualitier: { success: true, message: '', list: [] },
    };
    // 查询条件
    const startTime = params.filterTime[0];
    const endTime = params.filterTime[1];
    const whereSql = [
      `prd_type = ${PRD_TYPE}`,
    ];
    params.filterUgcStatus && params.filterUgcStatus.length && whereSql.push(`status in (${params.filterUgcStatus.join(',')})`);
    if (params.filterSource.length) {
      const source2 = params.filterSource.map((_s) => {
        const _sourceItem = MEDIA_UGCAUDIO_SOURCE.find(v => v.name === _s);
        return _sourceItem ? _sourceItem.key : _s;
      });
      whereSql.push(`(w_source in ('${params.filterSource.join('\',\'')}') or (w_source is null and top_user_type in ('${source2.join('\',\'')}')))`);
    }

    params.filterIsYoung.length && whereSql.push(`w_is_young in ("${params.filterIsYoung.join('","')}")`);
    params.filterIsMusic.length && whereSql.push(`w_is_music in (${params.filterIsMusic.join(',')})`);
    params.filterQuality.length && whereSql.push(`w_quality in (${params.filterQuality.join(',')})`);
    params.filterQualityReason && params.filterQualityReason.length && whereSql.push(`w_quality_reason in ('${params.filterQualityReason.join('\',\'')}')`);

    const connection = utils.getKgNewConnection();
    // 总计、质检统计
    const qualitierWhereSql = [
      ...whereSql,
      'w_status >= 1',
      'w_quality is not null',
      'w_quality_user is not null',
      `w_quality_time between '${startTime}' and '${endTime}'`,
    ];
    const qualitierSelectSql = `select status,ksongid,top_user_type,w_source,w_quality_user,w_quality_time,w_quality,w_is_music,w_labels from qmkg_videorec_media_content_info where ${qualitierWhereSql.join(' and ')};`;
    try {
      result.qualitier.list = await new Promise((resolve, reject) => {
        connection.query(qualitierSelectSql, (error, res) => {
          error ? reject({ error, type: 'selectInfo', qualitierSelectSql }) : resolve(res);
        });
      });
    } catch (error) {
      result.qualitier.success = false;
      result.qualitier.message = JSON.stringify(error);
    }
    dtd.resolve({ code: 0, subcode: 0, message: '', default: 0, data: result });
    connection.end();
  },
  // 查询任务执行结果
  async getLongTimeTaskResult() {
    const { t_key } = params;
    const taskParams = {
      t_key,
    };
    const taskResult = await MEDIA_MAP.selectMediaLongTimeTask(taskParams);
    if (!(taskResult.success && taskResult.result.length)) {
      dtd.resolve({ code: -1, subcode: 0, message: `查询任务进度异常（${t_key}），请咨询管理员`, data: { taskResult, taskParams } });
    } else {
      dtd.resolve({ code: 0, subcode: 0, message: '查询成功', data: { taskResult, taskParams } });
    }
  },
  // ugc增改操作日志：查询
  async getUgcOperationLog() {
    if (!(utils.ugcAudioAuth.manager || utils.ugcAudioAuth.log)) {
      dtd.resolve({ code: -1, subcode: 0, message: '无权限', default: 0, data: { userInfo } });
      return;
    }
    let whereSql = ['t_source=\'ugcAudio\''];
    params.t_time && params.t_time.length && whereSql.push(`t_time between '${params.t_time[0]}' and '${params.t_time[1]}'`);
    params.t_user && params.t_user.length && whereSql.push(`t_user in ('${params.t_user.join('\',\'')}')`);
    params.t_operation && params.t_operation.length && whereSql.push(`t_operation in ('${params.t_operation.join('\',\'')}')`);
    params.t_key && params.t_key.length && whereSql.push(`t_key in ('${params.t_key.join('\',\'')}')`);
    const page = params.page || 0;
    const size = params.size || 10;
    const startIndex = size * page;
    let listData = null;
    let total = 0;
    whereSql = whereSql.length ? `where ${whereSql.join(' and ')}` : '';
    const selectSql = `select * from t_media_system_operation_logs ${whereSql} ORDER BY id DESC limit ${startIndex},${size};`;
    const countSql = `select count(*) as num from t_media_system_operation_logs ${whereSql};`;
    const sql = { whereSql, selectSql, countSql };
    const connection = MEDIA_MAP.getMediaConnection();
    // 分页查询
    try {
      listData = await new Promise((resolve, reject) => {
        connection.query(selectSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      dtd.resolve({ code: -1, subcode: 0, message: '查询数据失败', default: 0, data: { error: e, ...sql } });
      connection.end();
      return;
    }
    // 计算总数
    try {
      total = await new Promise((resolve, reject) => {
        connection.query(countSql, (error, res) => {
          error ? reject(error) : resolve(res);
        });
      });
    } catch (e) {
      dtd.resolve({ code: -1, subcode: 0, message: '获取总数失败', default: 0, data: { error: e, ...sql } });
      connection.end();
      return;
    }
    dtd.resolve({
      code: 0,
      subcode: 0,
      message: '查询成功',
      data: { list: listData, total, ...sql },
    });
    connection.end();
  },

};

// webapp
const WEBAPP_MAP = {

  async reportSafe() {
    const result = { success: true, result: null, error: null };

    try {
      result.result = await new Promise((resolve, reject) => {
        common.ajax({
          ns: 'proto_recommend_channel',
          cmd: 'RecommendReportReq|153|1',
          data: {
            ugc_id: params.ugcid,
            uid: params.ugcid.split('_')[0],
            type: 4,
            operation: 1,
          },
          mapExt: {
            file: {
              filePathRelativeOutput: 'jce_new/kg/security_center/proto_recommend_channel_v2.js',
            },
            l5api: {
              mid: params.isTest ? 1277313 : 2099073,
              cid: params.isTest ? 4718592 : 65536,
            },
            ip: params.isTest ? '9.142.118.73' : '9.147.243.179',
            port: 15896,
            host_uin: userInfo.uid || userInfo.userid,
            client_uin: userInfo.uid || userInfo.userid,
          },
          success(res) {
            if (res.code === 0 && res.subcode === 0 && res.data.ret_code === 0) {
              resolve(res.data);
            } else {
              reject(res);
            }
          },
          error(err) {
            reject(err);
          },
        });
      });
    } catch (e) {
      result.success = false;
      result.error = e;
    }
    return result;
  },
};

const ACTION_MAP = {
  ...UGC_AUDIO_MAP,
};

async function main() {
  if (!params.isTest && !utils.checkOutsideLogin()) return;
  const { action } = params;
  if (ACTION_MAP[action]) {
    await ACTION_MAP[action]();
  } else {
    dtd.resolve({ code: -100, subcode: 0, message: '无此接口', default: 0, data: {} });
  }
}

try {
  main().catch((e) => {
    dtd.resolve({ code: -1, subcode: 0, message: '服务器方法运行错误！', data: { error: e.message, stack: e.stack } });
  });
} catch (e) {
  dtd.resolve({ code: -1, subcode: 0, message: '服务器运行错误！', data: { error: e.message, stack: e.stack } });
}
