import { Link } from 'react-router-dom'
import { Breadcrumb } from '../components/ui/Breadcrumb'

/** 404 page — breadcrumb + centered "404 Not Found" + back-home CTA. */
function NotFoundScreen() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mt-10">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
          <Breadcrumb
            crumbs={[
              { label: 'Home', to: '/' },
              { label: '404 Error' },
            ]}
          />
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium mb-8">
            404 Not Found
          </h1>
          <p className="text-base sm:text-lg text-muted-text mb-8 sm:mb-12">
            Your visited page not found. You may go home page.
          </p>
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-secondary px-8 text-base font-medium text-secondary-foreground hover:bg-secondary-hover"
          >
            Back to home page
          </Link>
        </div>
      </div>
    </div>
  )
}

export { NotFoundScreen }
