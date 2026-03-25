'use client'

import { portfolioData } from '@/lib/portfolio-data'
import { Code2, Layers, Wrench, Cloud } from 'lucide-react'
import { motion } from 'framer-motion'

const skillCategories = [
  {
    title: "Languages",
    icon: Code2,
    skills: portfolioData.skills.languages,
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Frameworks & Libraries",
    icon: Layers,
    skills: portfolioData.skills.frameworks,
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Tools & DevOps",
    icon: Wrench,
    skills: portfolioData.skills.tools,
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Cloud & Databases",
    icon: Cloud,
    skills: portfolioData.skills.cloud,
    color: "from-orange-500/20 to-yellow-500/20",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export function SkillsSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
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
            Technical Skills
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Technologies I <span className="gradient-text">Work With</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A comprehensive toolkit built over 4+ years of building production systems
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {skillCategories.map((category) => (
            <motion.div
              key={category.title}
              className="rounded-2xl glass p-6 space-y-5 hover-glow group"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {category.title}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    className="px-4 py-2 text-sm rounded-lg bg-secondary/80 text-foreground border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all cursor-default"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
