'use client'

import { portfolioData } from '@/lib/portfolio-data'
import { Briefcase, GraduationCap, Award, BookOpen, MapPin, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
}

export function ExperienceSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-sm text-primary font-medium mb-4">
            My Journey
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            From Code to <span className="gradient-text">Production</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A timeline of my professional journey, from building EV systems to AI-powered applications.
          </p>
        </motion.div>

        {/* Experience Timeline */}
        <div className="space-y-8 mb-20">
          <motion.h3 
            className="text-2xl font-semibold text-foreground flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            Work Experience
          </motion.h3>
          
          <motion.div 
            className="relative border-l-2 border-primary/30 pl-10 space-y-12 ml-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {portfolioData.experience.map((exp, index) => (
              <motion.div 
                key={index} 
                className="relative"
                variants={itemVariants}
              >
                {/* Timeline dot */}
                <motion.div 
                  className="absolute -left-[46px] w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/30"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                />
                
                <motion.div 
                  className="glass rounded-2xl p-6 space-y-4 hover-glow"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h4 className="text-xl font-semibold text-foreground">
                        {exp.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="font-medium text-primary">{exp.company}</span>
                        {exp.location && (
                          <>
                            <span className="text-border">|</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="flex items-center gap-2 text-sm text-primary font-medium px-3 py-1 rounded-full bg-primary/10 whitespace-nowrap">
                      <Calendar className="w-3 h-3" />
                      {exp.period}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {exp.highlights.map((highlight, i) => (
                      <motion.li 
                        key={i} 
                        className="text-sm text-muted-foreground leading-relaxed flex gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <span className="text-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                        {highlight}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Education & Achievements Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Education */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              Education
            </h3>
            <div className="space-y-4">
              {portfolioData.education.map((edu, index) => (
                <motion.div 
                  key={index} 
                  className="glass rounded-2xl p-5 space-y-2 hover-glow"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                  <p className="text-sm text-primary">{edu.school}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {edu.period}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-8">
            {/* Publications */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                Publications
              </h3>
              {portfolioData.publications.map((pub, index) => (
                <motion.div 
                  key={index} 
                  className="glass rounded-2xl p-5 space-y-2 hover-glow"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="font-semibold text-foreground text-sm">{pub.title}</h4>
                  <p className="text-xs text-muted-foreground">{pub.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Achievements */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                Achievements
              </h3>
              {portfolioData.achievements.map((achievement, index) => (
                <motion.div 
                  key={index} 
                  className="glass rounded-2xl p-5 space-y-2 hover-glow"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="font-semibold text-foreground text-sm">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
