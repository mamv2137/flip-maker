const es = {
  brand: { name: 'Bukify' },
  landing: {
    nav: {
      features: 'Funcionalidades',
      howItWorks: 'Cómo funciona',
      demo: 'Demo',
      pricing: 'Precios',
      signIn: 'Iniciar sesión',
      getStarted: 'Comenzar',
      dashboard: 'Panel',
    },
    hero: {
      badge: 'Directo desde Google Drive — cero subidas',
      headline: 'Convierte PDFs en',
      headlineAccent: 'experiencias que venden',
      subtitle:
        'Pega un link de Google Drive y en segundos tienes un libro interactivo con efecto 3D listo para compartir. Sin subidas, sin fricción, sin excusas.',
      cta: 'Publica tu primer ebook gratis',
      ctaAuth: 'Ir al Panel',
      footnote: 'Gratis para siempre · Sin tarjeta · Tus PDFs no salen de tu Drive',
    },
    features: {
      badge: 'Todo lo que necesitas',
      title: 'Tu contenido, tus reglas',
      subtitle:
        'Todo lo que necesitas para publicar, proteger y monetizar tu contenido digital.',
      items: [
        {
          title: 'Conecta Google Drive y listo',
          description:
            'Pega un link y tu libro interactivo se genera solo. Sin subir archivos, sin esperar, sin límites de almacenamiento.',
        },
        {
          title: 'Animación 3D que enamora',
          description: 'Tus lectores van a pasar páginas como si tuvieran el libro en las manos. Física realista, transiciones fluidas.',
        },
        {
          title: 'Un link, mil posibilidades',
          description: 'Cada libro tiene su propia URL. Comparte en WhatsApp, redes, email, o embébelo en Hotmart, WordPress — donde sea.',
        },
        {
          title: 'Tú decides quién lee',
          description: 'Público para todos o privado con invitación. Controla el acceso con links mágicos y contraseñas.',
        },
        {
          title: 'Perfecto en cualquier pantalla',
          description: 'Diseñado mobile-first. Gestos táctiles, teclado, pantalla completa — se adapta a todo.',
        },
        {
          title: 'Tu contenido blindado',
          description:
            'Lectura segura sin descargas ni copias. Tus PDFs nunca salen de tu control. Ideal para contenido premium.',
        },
      ],
    },
    process: {
      badge: 'Así de fácil',
      title: 'De PDF a libro interactivo en 60 segundos',
      subtitle: 'Tres pasos. Cero complicaciones. Tu contenido publicado antes de que termine el café.',
      steps: [
        {
          title: 'Pega el link de tu Drive',
          description:
            'Copia la URL de cualquier PDF en Google Drive y pégala en Bukify. No subes nada — tu archivo se queda donde está.',
        },
        {
          title: 'Personaliza y publica',
          description:
            'Elige portada, título y visibilidad. En un clic tienes una URL única lista para compartir.',
        },
        {
          title: 'Comparte y monetiza',
          description:
            'Envía el link por WhatsApp, embébelo en tu sitio o Hotmart, o invita lectores por email. Tu contenido siempre protegido.',
        },
      ],
    },
    demo: {
      badge: 'Míralo en acción',
      title: 'Así se siente leer en Bukify',
      subtitle: 'Arrastra las esquinas o usa las flechas. Esto es lo que tus lectores van a ver.',
    },
    cta: {
      title: 'Deja de compartir PDFs aburridos',
      subtitle:
        'Tus lectores merecen algo mejor. Publica tu primer libro interactivo en menos de un minuto — gratis, sin tarjeta, sin subir nada.',
      button: 'Publica tu ebook ahora',
      ctaAuth: 'Ir al Panel',
      footnote: 'Gratis para siempre · Sin tarjeta de crédito · Sin subidas',
    },
    footer: {
      description: 'Transforma PDFs en experiencias de lectura que tus clientes van a amar.',
      product: 'Producto',
      resources: 'Recursos',
      legal: 'Legal',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Servicio',
      signUp: 'Registrarse',
      copyright: '© {year} Bukify. Todos los derechos reservados.',
    },
    logoCloud: {
      tagline: 'Se integra con las plataformas que ya usas',
    },
    pricing: {
      badge: 'Precios simples',
      title: 'Crece a tu ritmo',
      subtitle: 'Empieza gratis, sin límite de tiempo. Escala solo cuando tu contenido lo pida.',
      monthly: 'Mensual',
      yearly: 'Anual',
      yearlyDiscount: 'Ahorra 2 meses',
      perMonth: '/mes',
      perYear: '/año',
      current: 'Plan actual',
      getStarted: 'Empezar gratis',
      upgrade: 'Elegir plan',
      comingSoon: 'Próximamente',
      viewsPerMonth: 'views/mes',
      unlimitedBooks: 'Libros ilimitados',
      popular: 'Más popular',
      plans: {
        free: {
          name: 'Free',
          description: 'Perfecto para empezar y probar',
          features: [
            '3 libros',
            '200 views/mes',
            'Google Drive',
            'Link público',
            'Categorías y ratings',
            'Watermark "Powered by Bukify"',
          ],
        },
        creator: {
          name: 'Creator',
          description: 'Para creadores que van en serio',
          features: [
            'Libros ilimitados',
            '2,000 views/mes',
            'Sin watermark',
            'Protección con contraseña',
            'Acceso privado por email',
            'Analytics básico',
          ],
        },
        pro_seller: {
          name: 'Pro Seller',
          description: 'Para quienes viven de su contenido',
          features: [
            'Todo en Creator',
            '10,000 views/mes',
            'Backup en R2',
            'Dominio personalizado',
            'Integración Shopify (próximamente)',
            'MercadoPago (próximamente)',
            'WhatsApp delivery (próximamente)',
          ],
        },
        agency: {
          name: 'Agency',
          description: 'Para agencias y equipos',
          features: [
            'Todo en Pro Seller',
            '50,000 views/mes',
            'White-label',
            'Soporte prioritario',
          ],
        },
      },
      overage: 'Excedente: $0.005 por view adicional',
    },
  },
  common: {
    loading: 'Cargando...',
    error: 'Ocurrió un error',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    back: 'Volver',
    next: 'Siguiente',
    search: 'Buscar',
    noResults: 'Sin resultados',
  },
}

export default es
