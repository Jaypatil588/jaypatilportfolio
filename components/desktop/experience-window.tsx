'use client'

import { useEffect } from 'react'
import { Briefcase, GraduationCap, Award, Calendar, MapPin } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { OSWindow } from './os-window'
import { useWindowManager } from './window-manager'

export function ExperienceWindow() {
  const { setWindowLoading } = useWindowManager()
  
  useEffect(() => {
    // Simulate loading delay for bounce animation
    const timer = setTimeout(() => {
      setWindowLoading('experience', false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [setWindowLoading])
  return (
    <OSWindow 
      id="experience"
      title="Experience" 
      icon="💼" 
      defaultPosition={{ x: 150, y: 100 }}
      defaultSize={{ width: 700, height: 520 }}
      headerColor="bg-gradient-to-r from-[#f093fb]/90 to-[#f5576c]/90"
    >
      <div className="h-full overflow-y-auto bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="p-5 space-y-6">
          {/* Work Experience */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 sticky top-0 bg-gradient-to-br from-rose-50 to-pink-50 py-2 z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f093fb] to-[#f5576c] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
            </div>
            
            <div className="relative border-l-2 border-pink-300 pl-6 ml-5 space-y-6">
              {portfolioData.experience.map((exp, index) => (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-gradient-to-br from-[#f093fb] to-[#f5576c] border-4 border-rose-50" />
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-0.5">
                          <span className="font-medium text-pink-600">{exp.company}</span>
                          {exp.location && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {exp.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-pink-600 bg-pink-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <Calendar className="w-3 h-3" />
                        {exp.period}
                      </span>
                    </div>
                    
                    <ul className="space-y-2">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Achievements */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Education */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold text-gray-900">Education</h3>
              </div>
              <div className="space-y-2">
                {portfolioData.education.map((edu, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-pink-100 shadow-sm">
                    <p className="font-medium text-gray-900 text-sm">{edu.degree}</p>
                    <p className="text-pink-600 text-sm">{edu.school}</p>
                    <p className="text-xs text-gray-500 mt-1">{edu.period}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold text-gray-900">Achievements</h3>
              </div>
              <div className="space-y-2">
                {portfolioData.achievements.map((achievement, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-pink-100 shadow-sm">
                    <p className="font-medium text-gray-900 text-sm">{achievement.title}</p>
                    <p className="text-gray-600 text-xs mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OSWindow>
  )
}
