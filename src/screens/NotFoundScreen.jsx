import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Breadcrumb } from '../components/ui/Breadcrumb'

/** 404 page — breadcrumb + centered "404 Not Found" + back-home CTA. */
function NotFoundScreen() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            crumbs={[
              { label: 'Home', to: '/' },
              { label: '404 Error' },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium mb-8">
            404 Not Found
          </h1>
          <p className="text-base sm:text-lg text-[#666666] mb-8 sm:mb-12">
            Your visited page not found. You may go home page.
          </p>
          <Button asChild className="h-12 px-8 bg-[#DB4444] hover:bg-[#DB4444]/90 rounded-sm text-base text-accent">
            <Link to="/">Back to home page</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export { NotFoundScreen }
