import React, { useState, useEffect, useRef } from "react"
import "./enhancedEventsCardStyles.css"

// Import actual event images
import ventus1 from "../../assets/ventus1.jpg"
import gateway1 from "../../assets/gateway1.jpg"
import ramadan1 from "../../assets/ramadan1.jpg"
import reepe1 from "../../assets/reepe1.jpg"
import opening1 from "../../assets/opening1.jpg"
import camp1 from "../../assets/camp1.jpg"
import cap1 from "../../assets/cap1.jpg"
import classiccontrol1 from "../../assets/classiccontrol1.jpg"
import coding from "../../assets/coding.jpg"
import breadboard from "../../assets/breadboard.jpg"
import arduino from "../../assets/arduino.jpg"
import robot from "../../assets/robot.jpg"
import solar1 from "../../assets/solar1.jpg"
import highvoltage1 from "../../assets/highvoltage1.JPG"

const eventData = {
  id: 1,
  title: "Ventus",
  category: "VR Workshop",
  description:
    "Participants had the opportunity to engage in a hands-on demo session of the GWO BTT Electrical module, fully experienced through virtual reality at the AAST Engineering Building. Hosted by Ventus Academy, the session brought global-standard wind energy training to Egypt and the MENA region, offering a cutting-edge introduction to the world of renewable energy and electrical systems.",
  date: "16-04-2025",
  time: "2:00 PM - 5:00 PM",
  location: "AAST Engineering Building B",
  attendees: 45,
  images: [
    ventus1,
    gateway1,
    ramadan1,
    reepe1,
    opening1,
    camp1,
    cap1,
    classiccontrol1,
    coding,
    breadboard,
    arduino,
    robot,
    solar1,
    highvoltage1
  ],
}

const EnhancedEventsCard = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [imageScale, setImageScale] = useState(1)
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const cardCenter = rect.top + rect.height / 2
        const distanceFromCenter = Math.abs(windowHeight / 2 - cardCenter)
        const maxDistance = windowHeight / 2
        const normalizedDistance = Math.max(0, Math.min(1, distanceFromCenter / maxDistance))
        const scale = 1 + 0.2 * (1 - normalizedDistance)
        setImageScale(scale)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % eventData.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + eventData.images.length) % eventData.images.length)
  }

  useEffect(() => {
    const interval = setInterval(nextImage, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4">Our Events</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover the amazing events we've hosted and the impact we've made in the community
          </p>
        </div>

        <div
          ref={cardRef}
          className={`overflow-hidden transition-all duration-1000 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          } hover:shadow-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl`}
        >
          <div className="grid lg:grid-cols-2 gap-0 min-h-[600px]">
            {/* Event Details Section */}
            <div className="p-8 lg:p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-white/20 text-white border border-white/30 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    {eventData.category}
                  </span>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <span className="text-white/80 text-sm">Featured Event</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {eventData.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-blue-100">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="text-sm font-medium">{eventData.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    <span className="text-sm font-medium">{eventData.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-sm font-medium">{eventData.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="text-sm font-medium">{eventData.attendees} attendees</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-blue-100">Session Details</h3>
                  <p className="text-blue-50 leading-relaxed">{eventData.description}</p>
                </div>

                <div className="mt-8 flex gap-4">
                  <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm hover:transform hover:scale-105">
                    View Gallery
                  </button>
                  <button className="border border-white/30 text-white hover:bg-white/10 bg-transparent px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:transform hover:scale-105">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Image Slideshow Section */}
            <div className="relative bg-slate-900 overflow-hidden">
              <div
                className="relative w-full h-full transition-transform duration-500 ease-out"
                style={{ transform: `scale(${imageScale})` }}
              >
                <img
                  src={eventData.images[currentImageIndex] || "/placeholder.svg"}
                  alt={`${eventData.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="15,18 9,12 15,6" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </button>

              {/* Image Counter Dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {eventData.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              {/* Image Number Badge */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {currentImageIndex + 1} / {eventData.images.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedEventsCard 