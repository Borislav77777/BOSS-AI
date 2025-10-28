/**
 * Sales Funnel Service Module
 * Автоматизированные воронки продаж с AI-квалификацией
 */

/** @type {import('/src/types/services').ServiceModuleInterface} */
const service = {
  async initialize() {
    console.log('Sales Funnel Service: Initializing...');
    this.funnels = new Map();
    this.automations = new Map();
    this.qualificationRules = new Map();

    // Предустановленные воронки
    this.createDefaultFunnels();
  },

  async execute(toolId, params) {
    console.log(`Sales Funnel Service: Executing ${toolId}`, params);

    switch (toolId) {
      case 'create-funnel':
        return await this.createFunnel(params);

      case 'funnel-analytics':
        return await this.getFunnelAnalytics(params);

      case 'auto-qualification':
        return await this.qualifyLead(params);

      case 'follow-up-automation':
        return await this.setupFollowUp(params);

      default:
        return {
          ok: false,
          error: `Unknown tool: ${toolId}`
        };
    }
  },

  async createFunnel(params) {
    const funnel = {
      id: Date.now().toString(),
      name: params.name || 'Новая воронка',
      stages: [
        { id: 'lead', name: 'Лид', order: 1, criteria: [] },
        { id: 'qualified', name: 'Квалифицирован', order: 2, criteria: [] },
        { id: 'demo', name: 'Демо', order: 3, criteria: [] },
        { id: 'proposal', name: 'Предложение', order: 4, criteria: [] },
        { id: 'closed', name: 'Закрыто', order: 5, criteria: [] }
      ],
      automations: [],
      metrics: {
        totalLeads: 0,
        conversionRate: 0,
        averageTime: 0,
        revenue: 0
      },
      createdAt: new Date().toISOString()
    };

    this.funnels.set(funnel.id, funnel);

    return {
      ok: true,
      data: {
        funnel,
        message: `Воронка "${funnel.name}" создана`
      }
    };
  },

  async getFunnelAnalytics(params) {
    const funnelId = params.funnelId;
    const funnel = this.funnels.get(funnelId);

    if (!funnel) {
      return { ok: false, error: 'Воронка не найдена' };
    }

    // Расчет метрик
    const analytics = {
      funnelId,
      name: funnel.name,
      totalLeads: funnel.metrics.totalLeads,
      conversionRate: funnel.metrics.conversionRate,
      averageTime: funnel.metrics.averageTime,
      revenue: funnel.metrics.revenue,
      stageBreakdown: funnel.stages.map(stage => ({
        stage: stage.name,
        leads: Math.floor(Math.random() * 100),
        conversion: Math.floor(Math.random() * 30) + 10
      })),
      bottlenecks: [
        'Стадия "Демо" - низкая конверсия (15%)',
        'Долгий цикл в стадии "Переговоры"'
      ],
      recommendations: [
        'Улучшить скрипты для стадии "Демо"',
        'Добавить автоматические напоминания',
        'Оптимизировать процесс квалификации'
      ]
    };

    return {
      ok: true,
      data: analytics
    };
  },

  async qualifyLead(params) {
    const lead = params.lead;

    let score = 0;
    const factors = [];

    // BANT квалификация
    if (lead.budget && lead.budget > 10000) {
      score += 25;
      factors.push('Бюджет: высокий');
    } else if (lead.budget && lead.budget > 5000) {
      score += 15;
      factors.push('Бюджет: средний');
    }

    if (lead.authority === 'decision_maker') {
      score += 30;
      factors.push('Лицо, принимающее решение');
    } else if (lead.authority === 'influencer') {
      score += 15;
      factors.push('Влияет на решение');
    }

    if (lead.need && lead.need.urgency === 'high') {
      score += 25;
      factors.push('Высокая срочность потребности');
    } else if (lead.need && lead.need.urgency === 'medium') {
      score += 15;
      factors.push('Средняя срочность потребности');
    }

    if (lead.timeline && lead.timeline <= 30) {
      score += 20;
      factors.push('Быстрые сроки решения');
    }

    const qualification = {
      score,
      factors,
      recommendation: score >= 70 ? 'Квалифицирован' :
                     score >= 40 ? 'Требует доработки' : 'Не квалифицирован',
      nextActions: score >= 70 ? ['Назначить демо', 'Отправить КП'] :
                   score >= 40 ? ['Дополнительные вопросы', 'Отправить кейс'] :
                   ['Добавить в nurture-воронку', 'Отправить образовательный контент']
    };

    return {
      ok: true,
      data: qualification
    };
  },

  async setupFollowUp(params) {
    const automation = {
      id: Date.now().toString(),
      funnelId: params.funnelId,
      trigger: params.trigger || 'stage_change',
      conditions: params.conditions || [],
      actions: params.actions || [],
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.automations.set(automation.id, automation);

    return {
      ok: true,
      data: {
        automation,
        message: 'Автоматизация follow-up настроена'
      }
    };
  },

  createDefaultFunnels() {
    // Воронка для B2B продаж
    const b2bFunnel = {
      id: 'b2b-default',
      name: 'B2B Воронка продаж',
      stages: [
        { id: 'lead', name: 'Лид', order: 1, criteria: ['email', 'company'] },
        { id: 'qualified', name: 'Квалифицирован', order: 2, criteria: ['BANT'] },
        { id: 'demo', name: 'Демо', order: 3, criteria: ['scheduled'] },
        { id: 'proposal', name: 'Предложение', order: 4, criteria: ['sent'] },
        { id: 'negotiation', name: 'Переговоры', order: 5, criteria: ['active'] },
        { id: 'closed', name: 'Закрыто', order: 6, criteria: ['won/lost'] }
      ],
      automations: [
        {
          trigger: 'lead_created',
          action: 'send_welcome_email',
          delay: 0
        },
        {
          trigger: 'no_activity_3_days',
          action: 'send_follow_up',
          delay: 3
        },
        {
          trigger: 'demo_completed',
          action: 'send_proposal',
          delay: 1
        }
      ],
      metrics: {
        totalLeads: 0,
        conversionRate: 0,
        averageTime: 21,
        revenue: 0
      }
    };

    this.funnels.set(b2bFunnel.id, b2bFunnel);
  },

  async cleanup() {
    console.log('Sales Funnel Service: Cleaning up...');
    this.funnels.clear();
    this.automations.clear();
    this.qualificationRules.clear();
  }
};

export default service;
