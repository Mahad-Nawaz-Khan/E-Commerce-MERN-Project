import { Link } from 'react-router-dom'
import { Linkedin, Instagram, Twitter } from '../ui/SocialIcons'

const teamMembers = [
  {
    image: '/images/team/tom.png',
    name: 'Tom Cruise',
    role: 'Founder & Chairman',
    socials: { twitter: '/', instagram: '/', linkedin: '/' },
  },
  {
    image: '/images/team/emma.png',
    name: 'Emma Watson',
    role: 'Managing Director',
    socials: { twitter: '/', instagram: '/', linkedin: '/' },
  },
  {
    image: '/images/team/will.png',
    name: 'Will Smith',
    role: 'Product Designer',
    socials: { twitter: '/', instagram: '/', linkedin: '/' },
  },
]

/** Team grid (3 members) with social links + static navigation dots (3rd active). */
function TeamMembers() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <div key={member.name} className="bg-surface p-8 flex flex-col items-center text-center">
            <div className="relative w-full h-75 mb-8">
              <img
                src={member.image}
                alt={member.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <h3 className="font-poppins text-8 font-medium mb-2">
              {member.name}
            </h3>
            <p className="font-inter text-base text-muted-text mb-6">
              {member.role}
            </p>
            <div className="flex items-center gap-4">
              <Link to={member.socials.twitter} className="text-black hover:text-secondary transition-colors">
                <Twitter className="w-6 h-6" />
              </Link>
              <Link to={member.socials.instagram} className="text-black hover:text-secondary transition-colors">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link to={member.socials.linkedin} className="text-black hover:text-secondary transition-colors">
                <Linkedin className="w-6 h-6" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {[0, 1, 2, 3, 4].map((dot) => (
          <button
            key={dot}
            className={`w-3 h-3 rounded-full ${dot === 2 ? 'bg-secondary' : 'bg-dot-inactive'}`}
            aria-label={`Go to slide ${dot + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export { TeamMembers }
