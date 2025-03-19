<template>
  <div class="about-container">
    <header class="about-header">
      <h1>Sobre PACTA</h1>
      <div class="tagline">Tus contratos, al alcance de un clic.</div>
    </header>

    <section class="about-section">
      <div class="about-card">
        <h2>Introducción</h2>
        <p>
          En un entorno empresarial donde la eficiencia y la agilidad son clave para el éxito, 
          la gestión de contratos representa un desafío significativo. Miles de empresas enfrentan 
          pérdidas de tiempo y recursos debido a procesos manuales engorrosos que dificultan la 
          manipulación, actualización y seguimiento de contratos.
        </p>
        <p>
          Para abordar esta problemática, desarrollamos PACTA, 
          diseñada para revolucionar la forma en que las empresas gestionan sus contratos.
        </p>
      </div>

      <div class="about-card">
        <h2>Nuestra Solución</h2>
        <p>
          PACTA es una herramienta digital que permite a las empresas gestionar de manera 
          eficiente y ágil todo el ciclo de vida de sus contratos, desde la creación hasta 
          la renovación o cierre.
        </p>
        <p>
          Nuestra aplicación ofrece funcionalidades clave, como la automatización de procesos, 
          la notificación oportuna de vencimientos, la búsqueda eficaz, y la creación de plantillas 
          de contratos e impresión de los mismos, garantizando el control y la seguridad en el 
          manejo de los documentos.
        </p>
      </div>
    </section>

    <section class="objective-section">
      <h2 class="section-title">Nuestros Objetivos</h2>
      
      <div class="general-objective">
        <div class="objective-icon">
          <i class="fas fa-bullseye"></i>
        </div>
        <div class="objective-content">
          <h3>Objetivo General</h3>
          <p>
            Desarrollar una aplicación web que automatice y simplifique la gestión integral 
            de los contratos empresariales, brindando a las organizaciones una solución eficiente 
            y ágil para el control, notificación, creación, actualización y cierre de sus contratos.
          </p>
        </div>
      </div>

      <div class="specific-objectives">
        <h3>Objetivos Específicos</h3>
        <ul class="objectives-list">
          <li>
            <i class="fas fa-user-shield"></i>
            <span>Diseñar funcionalidades de roles para garantizar el manejo adecuado de los contratos por parte de los usuarios.</span>
          </li>
          <li>
            <i class="fas fa-bell"></i>
            <span>Implementar un sistema de notificación para alertar sobre contratos próximos a vencer.</span>
          </li>
          <li>
            <i class="fas fa-file-alt"></i>
            <span>Facilitar la creación y utilización de plantillas de contratos personalizables.</span>
          </li>
          <li>
            <i class="fas fa-search"></i>
            <span>Incorporar funcionalidades de almacenamiento, búsqueda, actualización y cierre de contratos para optimizar la gestión de los mismos.</span>
          </li>
          <li>
            <i class="fas fa-code"></i>
            <span>Integrar tecnologías modernas para el desarrollo eficiente y escalable de la aplicación.</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="conclusion-section">
      <div class="conclusion-card">
        <h2>Conclusiones</h2>
        <p>
          PACTA representa una solución innovadora para la gestión de contratos empresariales. 
          Al automatizar procesos y ofrecer herramientas avanzadas, esta aplicación permite a las 
          empresas ahorrar tiempo y recursos, mejorando su productividad y competitividad.
        </p>
        <p>
          Además, su enfoque modular y escalable asegura que pueda adaptarse a las necesidades 
          cambiantes del mercado.
        </p>
        <div class="cta-wrapper">
          <button class="cta-button">Comenzar ahora</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Componente simple sin lógica adicional
</script>

<style lang="scss" scoped>
@use '../../assets/styles/variables' as v;
@use '../../assets/styles/colors' as c;
@use '../../assets/styles/mixins' as m;

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: v.$spacing-unit * 4;
}

.about-header {
  text-align: center;
  margin-bottom: v.$spacing-unit * 6;
  
  h1 {
    font-size: 2.5rem;
    color: c.$color-primary;
    margin-bottom: v.$spacing-unit * 2;
  }
  
  .tagline {
    font-size: 1.25rem;
    color: c.$color-text-secondary;
    font-style: italic;
  }
}

.about-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: v.$spacing-unit * 4;
  margin-bottom: v.$spacing-unit * 6;
}

.about-card {
  background: white;
  border-radius: v.$border-radius;
  box-shadow: v.$shadow-sm;
  padding: v.$spacing-unit * 4;
  
  h2 {
    color: c.$color-primary;
    margin-bottom: v.$spacing-unit * 3;
    padding-bottom: v.$spacing-unit;
    border-bottom: 1px solid c.$color-border;
  }
  
  p {
    color: c.$color-text-primary;
    line-height: 1.6;
    margin-bottom: v.$spacing-unit * 2;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.section-title {
  text-align: center;
  margin-bottom: v.$spacing-unit * 4;
  color: c.$color-primary;
  font-size: 1.75rem;
}

.objective-section {
  margin-bottom: v.$spacing-unit * 6;
}

.general-objective {
  display: flex;
  align-items: flex-start;
  gap: v.$spacing-unit * 3;
  background: white;
  border-radius: v.$border-radius;
  box-shadow: v.$shadow-sm;
  padding: v.$spacing-unit * 4;
  margin-bottom: v.$spacing-unit * 5;
  
  .objective-icon {
    background: c.$color-primary;
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 1.5rem;
    }
  }
  
  .objective-content {
    flex: 1;
    
    h3 {
      color: c.$color-primary;
      margin-bottom: v.$spacing-unit * 2;
    }
    
    p {
      color: c.$color-text-primary;
      line-height: 1.6;
    }
  }
}

.specific-objectives {
  background: white;
  border-radius: v.$border-radius;
  box-shadow: v.$shadow-sm;
  padding: v.$spacing-unit * 4;
  
  h3 {
    color: c.$color-primary;
    margin-bottom: v.$spacing-unit * 3;
    text-align: center;
  }
}

.objectives-list {
  list-style: none;
  padding: 0;
  
  li {
    display: flex;
    align-items: center;
    gap: v.$spacing-unit * 2;
    padding: v.$spacing-unit * 2 0;
    border-bottom: 1px solid c.$color-border;
    
    &:last-child {
      border-bottom: none;
    }
    
    i {
      color: c.$color-accent;
      font-size: 1.25rem;
      min-width: 24px;
      text-align: center;
    }
    
    span {
      color: c.$color-text-primary;
      line-height: 1.5;
    }
  }
}

.conclusion-section {
  margin-bottom: v.$spacing-unit * 4;
}

.conclusion-card {
  background: white;
  border-radius: v.$border-radius;
  box-shadow: v.$shadow-sm;
  padding: v.$spacing-unit * 4;
  
  h2 {
    color: c.$color-primary;
    text-align: center;
    margin-bottom: v.$spacing-unit * 3;
    padding-bottom: v.$spacing-unit;
    border-bottom: 1px solid c.$color-border;
  }
  
  p {
    color: c.$color-text-primary;
    line-height: 1.6;
    margin-bottom: v.$spacing-unit * 2;
    text-align: center;
  }
}

.cta-wrapper {
  display: flex;
  justify-content: center;
  margin-top: v.$spacing-unit * 4;
}

.cta-button {
  background: c.$color-accent;
  color: white;
  padding: v.$spacing-unit * 1.5 v.$spacing-unit * 4;
  border: none;
  border-radius: v.$border-radius;
  font-size: 1rem;
  font-weight: v.$font-weight-medium;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .about-section {
    grid-template-columns: 1fr;
  }
  
  .general-objective {
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .objective-icon {
      margin-bottom: v.$spacing-unit * 2;
    }
  }
}
</style> 