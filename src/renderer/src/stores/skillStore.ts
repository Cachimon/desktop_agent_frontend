import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SkillMetadata, SkillDetail } from '@/types/skill'
import { STORAGE_KEY_SKILL } from '@/constants'

export const useSkillStore = defineStore(
  'skill',
  () => {
    const skills = ref<SkillMetadata[]>([])
    const selectedSkill = ref<SkillDetail | null>(null)
    const loaded = ref(false)

    function setSkills(list: SkillMetadata[]): void {
      skills.value = list
      loaded.value = true
    }

    function setSelectedSkill(detail: SkillDetail): void {
      selectedSkill.value = detail
    }

    function clearSelectedSkill(): void {
      selectedSkill.value = null
    }

    return {
      skills,
      selectedSkill,
      loaded,
      setSkills,
      setSelectedSkill,
      clearSelectedSkill
    }
  },
  {
    persist: {
      key: STORAGE_KEY_SKILL,
      pick: ['skills', 'loaded']
    }
  }
)
