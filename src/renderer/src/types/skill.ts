export interface SkillMetadata {
  name: string
  description: string
  version: string
  enabled: boolean
  category?: string
}

export interface SkillDetail {
  name: string
  description: string
  version: string
  instructions: string
  parameters: SkillParameter[]
  enabled: boolean
}

export interface SkillParameter {
  name: string
  type: string
  description: string
  required: boolean
  default_value?: string
}
