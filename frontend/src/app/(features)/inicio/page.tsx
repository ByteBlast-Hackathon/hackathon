// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  UploadCloud, 
  FileCheck, 
  Shield, 
  Zap, 
  Clock, 
  CheckCircle, 
  Users, 
  BarChart3,
  ArrowRight,
  Star,
  Play
} from "lucide-react";

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Estatísticas animadas
  const stats = [
    { value: "98%", label: "Precisão na Análise" },
    { value: "5min", label: "Tempo Médio de Resposta" },
    { value: "10K+", label: "Exames Processados" },
    { value: "24/7", label: "Disponibilidade" }
  ];

  // Recursos
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Processamento Rápido",
      description: "Análise automatizada em minutos, não em dias"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Segurança Garantida",
      description: "Seus dados protegidos com criptografia de ponta"
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Resultados Precisos",
      description: "Algoritmos avançados para decisões confiáveis"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Disponível 24/7",
      description: "Sistema sempre disponível quando você precisar"
    }
  ];

  // Passos do processo
  const steps = [
    {
      step: "01",
      title: "Upload do PDF",
      description: "Faça upload do pedido de exame em formato PDF"
    },
    {
      step: "02",
      title: "Análise Automatizada",
      description: "Nossa IA analisa o documento em segundos"
    },
    {
      step: "03",
      title: "Resultado Imediato",
      description: "Receba a autorização ou orientações específicas"
    }
  ];

  // Depoimentos
  const testimonials = [
    {
      name: "Dr. Carlos Silva",
      role: "Cardiologista",
      content: "O sistema reduziu nosso tempo de autorização de 2 dias para 5 minutos. Incrível!",
      rating: 5
    },
    {
      name: "Dra. Maria Santos",
      role: "Radiologista",
      content: "A precisão nas análises é notável. Confio completamente nos resultados.",
      rating: 5
    },
    {
      name: "Hospital São Lucas",
      role: "Instituição",
      content: "Implementamos em toda nossa rede e os resultados foram transformadores.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-2xl font-bold text-green-900">UniAI</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {["Início", "Recursos", "Como Funciona", "Depoimentos"].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-green-900 hover:text-green-600 transition-colors font-medium"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Começar Agora
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="início" className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6"
              >
                <Star className="w-4 h-4 mr-2 fill-green-600" />
                Sistema de Autorização de Exames por IA
              </motion.div>

              <h1 className="text-5xl lg:text-6xl font-bold text-green-900 leading-tight mb-6">
                Autorização de Exames
                <span className="text-green-600 block">Inteligente e Rápida</span>
              </h1>

              <p className="text-xl text-green-700 mb-8 leading-relaxed">
                Transforme o processo de autorização de exames com nossa IA avançada. 
                Resultados em minutos, não em dias.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Experimentar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </motion.button>

                <motion.button
                  className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="mr-2 w-5 h-5" />
                  Ver Demonstração
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-green-200">
                <div className="bg-green-600 text-white rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-lg">Sistema de Autorização de Exames</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">U</div>
                    <div className="bg-green-50 p-4 rounded-2xl">
                      <p className="text-green-900">Olá! Para iniciar a verificação, por favor, envie o seu pedido de exame em formato PDF.</p>
                    </div>
                  </div>
                </div>

                <motion.button
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <UploadCloud className="w-5 h-5" />
                  Anexar Pedido de Exame (PDF)
                </motion.button>
              </div>

              {/* Elementos decorativos */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-green-200 rounded-full opacity-50"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-300 rounded-full opacity-60"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0.9, 0.6]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div
                  className="text-3xl lg:text-4xl font-bold text-green-600 mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-green-900 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-green-900 mb-4">
              Por que Escolher o UniAI?
            </h2>
            <p className="text-xl text-green-700 max-w-2xl mx-auto">
              Tecnologia avançada para simplificar e acelerar o processo de autorização de exames
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-green-100 text-center"
              >
                <motion.div
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-green-700">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-green-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-green-700 max-w-2xl mx-auto">
              Três passos simples para obter autorização rápida de exames
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-green-700">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-green-200 transform -translate-y-1/2 z-0">
                    <motion.div
                      className="h-full bg-green-600"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                      viewport={{ once: true }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-green-900 mb-4">
              O que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-green-700 max-w-2xl mx-auto">
              Profissionais de saúde que confiam em nossa tecnologia
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-lg border border-green-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-green-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-bold text-green-900">{testimonial.name}</div>
                  <div className="text-green-600 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Pronto para Transformar seu Processo?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de profissionais de saúde que já estão economizando tempo e melhorando a eficiência
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Começar Agora
              </motion.button>
              <motion.button
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Agendar Demonstração
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-green-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">U</span>
                </div>
                <span className="text-xl font-bold text-white">UniAI</span>
              </div>
              <p className="text-green-300">
                Tecnologia avançada para autorização inteligente de exames médicos.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Suporte</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Vendas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Parcerias</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-green-800 mt-8 pt-8 text-center text-green-400">
            <p>&copy; 2024 UniAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;