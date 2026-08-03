import { OurStory } from '../components/about/our-story'
import { SiteStats } from '../components/about/site-stats'
import { TeamMembers } from '../components/about/team-members'
import { ServiceFeatures } from '../components/about/service-features'

/** About route — story, stats, team, and service guarantees in the Midnight Showroom theme. */
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
