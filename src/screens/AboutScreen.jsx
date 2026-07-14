import { OurStory } from '@/components/about/OurStory'
import { SiteStats } from '@/components/about/SiteStats'
import { TeamMembers } from '@/components/about/TeamMembers'
import { ServiceFeatures } from '@/components/home/ServiceFeatures'

/** About route — OurStory + SiteStats + TeamMembers + ServiceFeatures. */
function AboutScreen() {
  return (
    <div>
      <OurStory />
      <SiteStats />
      <TeamMembers />
      <ServiceFeatures />
    </div>
  )
}

export { AboutScreen }
