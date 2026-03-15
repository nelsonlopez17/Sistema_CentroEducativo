
-- =========================================
-- CREAR BASE DE DATOS
-- =========================================
--CREATE DATABASE sistema_academico;

-- =========================================
-- CONECTARSE A LA BASE (ejecutar manualmente si es necesario)
-- \c sistema_academico
-- =========================================


-- =========================================
-- TABLA ROL
-- =========================================
CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150),

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_modificacion TIMESTAMP,
    usuario_modificacion INTEGER,
    fecha_eliminacion TIMESTAMP
);


-- =========================================
-- TABLA USUARIO
-- =========================================
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    id_rol INTEGER NOT NULL,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_modificacion TIMESTAMP,
    usuario_modificacion INTEGER,
    fecha_eliminacion TIMESTAMP,

    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);


-- =========================================
-- TABLA ESTADO_ALUMNO
-- =========================================
CREATE TABLE estado_alumno (
    id_estado SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    descripcion VARCHAR(100)
);


-- =========================================
-- TABLA DOCENTE
-- =========================================
CREATE TABLE docente (
    id_docente SERIAL PRIMARY KEY,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    id_usuario INTEGER UNIQUE,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_modificacion TIMESTAMP,
    usuario_modificacion INTEGER,
    fecha_eliminacion TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);


-- =========================================
-- TABLA ALUMNO
-- =========================================
CREATE TABLE alumno (
    id_alumno SERIAL PRIMARY KEY,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    cui VARCHAR(20) UNIQUE,
    fecha_nacimiento DATE,
    id_usuario INTEGER UNIQUE,
    id_estado INTEGER NOT NULL,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_modificacion TIMESTAMP,
    usuario_modificacion INTEGER,
    fecha_eliminacion TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_estado) REFERENCES estado_alumno(id_estado)
);


-- =========================================
-- TABLA CARRERA
-- =========================================
CREATE TABLE carrera (
    id_carrera SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_modificacion TIMESTAMP,
    usuario_modificacion INTEGER,
    fecha_eliminacion TIMESTAMP
);


-- =========================================
-- TABLA GRADO
-- =========================================
CREATE TABLE grado (
    id_grado SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);


-- =========================================
-- TABLA SECCION
-- =========================================
CREATE TABLE seccion (
    id_seccion SERIAL PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL
);


-- =========================================
-- TABLA CURSO
-- =========================================
CREATE TABLE curso (
    id_curso SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion VARCHAR(200),

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,
    fecha_modificacion TIMESTAMP,
    usuario_modificacion INTEGER,
    fecha_eliminacion TIMESTAMP
);


-- =========================================
-- TABLA PENSUM
-- =========================================
CREATE TABLE pensum (
    id_pensum SERIAL PRIMARY KEY,
    id_carrera INTEGER NOT NULL,
    id_curso INTEGER NOT NULL,
    id_grado INTEGER NOT NULL,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER,

    FOREIGN KEY (id_carrera) REFERENCES carrera(id_carrera),
    FOREIGN KEY (id_curso) REFERENCES curso(id_curso),
    FOREIGN KEY (id_grado) REFERENCES grado(id_grado),

    UNIQUE(id_carrera,id_curso,id_grado)
);


-- =========================================
-- TABLA CICLO ESCOLAR
-- =========================================
CREATE TABLE ciclo_escolar (
    id_ciclo SERIAL PRIMARY KEY,
    anio INTEGER,
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE
);


-- =========================================
-- TABLA PERIODO
-- =========================================
CREATE TABLE periodo (
    id_periodo SERIAL PRIMARY KEY,
    nombre VARCHAR(50),
    numero INTEGER,
    id_ciclo INTEGER,

    FOREIGN KEY (id_ciclo) REFERENCES ciclo_escolar(id_ciclo)
);


-- =========================================
-- TABLA ASIGNACION_CURSO
-- =========================================
CREATE TABLE asignacion_curso (
    id_asignacion SERIAL PRIMARY KEY,
    id_docente INTEGER NOT NULL,
    id_pensum INTEGER NOT NULL,
    id_seccion INTEGER NOT NULL,
    id_ciclo INTEGER NOT NULL,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_docente) REFERENCES docente(id_docente),
    FOREIGN KEY (id_pensum) REFERENCES pensum(id_pensum),
    FOREIGN KEY (id_seccion) REFERENCES seccion(id_seccion),
    FOREIGN KEY (id_ciclo) REFERENCES ciclo_escolar(id_ciclo)
);


-- =========================================
-- TABLA INSCRIPCION
-- =========================================
CREATE TABLE inscripcion (
    id_inscripcion SERIAL PRIMARY KEY,
    id_alumno INTEGER NOT NULL,
    id_asignacion INTEGER NOT NULL,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
    FOREIGN KEY (id_asignacion) REFERENCES asignacion_curso(id_asignacion),

    UNIQUE(id_alumno,id_asignacion)
);


-- =========================================
-- TABLA NOTA
-- =========================================
CREATE TABLE nota (
    id_nota SERIAL PRIMARY KEY,
    id_inscripcion INTEGER NOT NULL,
    id_periodo INTEGER NOT NULL,
    nota NUMERIC(5,2) CHECK (nota >= 0 AND nota <= 100),

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_inscripcion) REFERENCES inscripcion(id_inscripcion),
    FOREIGN KEY (id_periodo) REFERENCES periodo(id_periodo),

    UNIQUE(id_inscripcion,id_periodo)
);
commit;

select * from alumno;