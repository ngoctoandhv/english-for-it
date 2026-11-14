class ScenarioSerializer
  def self.summary(scenario, progress: nil)
    { id: scenario.id, title: scenario.title, slug: scenario.slug, description: scenario.description, level: scenario.level,
      lines_count: scenario.scenario_dialogues.size, last_position: progress&.last_position, completed: progress&.completed_at.present? }
  end

  def self.detail(scenario, progress: nil)
    summary(scenario, progress: progress).merge(
      situation: scenario.situation,
      dialogues: scenario.scenario_dialogues.map do |d|
        { id: d.id, position: d.position, speaker: d.speaker, role: d.role, text_en: d.text_en, text_vi: d.text_vi, tip: d.tip }
      end
    )
  end

  def self.admin(scenario)
    detail(scenario).merge(status: scenario.status, position: scenario.position)
  end
end
