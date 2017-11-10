# Script que permite evaluar distintos algoritmos disponibles en mlr

t<-proc.time() # Se mide el tiempo de inicio
pid<-Sys.getpid() # Obtener numero de proceso
cat("\nPID: ", pid, "\n\n")

#Cargamos las librerias
library(mlr) # Para machine learning

# Suprimiendo mensajes de warnings
options(warn = -1)

# Se leen los parametros
parametros<-commandArgs(trailingOnly = FALSE)


# Parametros del script
nombre_archivo_ejemplos<-parametros[6]

nombre_archivo_descripcion_set_datos<-parametros[7]

nombre_archivo_configuraciones<-parametros[8]

# Se cambia a que no produzca error al cargar un parametro que no tenga descripcion
configureMlr(on.par.without.desc = "quiet")

# Se carga las variables que especifican el formato del archivo del set de datos
source(nombre_archivo_descripcion_set_datos)

# Se cargan las variables de configuracion
source(nombre_archivo_configuraciones)

archivo.avance<-paste0(carpeta_salida, "Avance.csv")
constante.inicio.archivo.salida<-paste0(carpeta_salida, "Performance_")

archivo.resumen<-paste0(carpeta_salida, "Resumen.csv")

if(!dir.exists(carpeta_salida)){

  dir.create(carpeta_salida)
}

if(paralelizacion == TRUE){
  library(parallelMap) # para trabajar de forma paralela con mlr
  library(doParallel) # Libreria para hacer procesos paralelos que se esta ocupando para detectar el numero de cores
}

# leyendo los ejemplos a evaluar
datos<-read.csv(nombre_archivo_ejemplos, header = cabecera.archivo)

# Dando nombre a la columna del target
nombre.target<-"clase"
colnames(datos)[columna.clase]<-nombre.target

# definiendo la tarea
tarea<-makeClassifTask(id = "clasificacion",
                       data = datos,
                       target = nombre.target)
cat("\n\n")
print(tarea)
cat("\n\n")

# Si normalizamos los datos
if(normalizacion == TRUE){

  source("Normalizacion.R")
  datos<-normalizacion_por_columnas(datos)[[1]]
}

# Si el archivo de avance existe se borra
unlink(archivo.avance)
unlink(archivo.resumen)

cat("PID: ",pid, "\n\n", file = archivo.avance, append = TRUE)

if(paralelizacion == TRUE){
  # Si vamos a usar todos los cores
  if(cores == "ALL"){

    cores<-detectCores()

  }

  cat("\nSe han detectado ", detectCores(), " cores\n\n")
  cat("\nSe tabajara con ", cores, " cores\n\n")
}


metodo.muestreo<-muestreo$id

for(i in 1:length(Algoritmos)){

  tiempo<-paste(round((proc.time()-t)[3], digits = 1), "seg")

  Algoritmo<-Algoritmos[i]
  cat("A los ", tiempo, "\n")
  cat("Se evalua el algoritmo: ", Algoritmo, "\n")
  cat("Usando el metodo de muestreo: ", metodo.muestreo, "\n")
  cat("\n\n")

  cat("A los ", tiempo, "\n", file = archivo.avance, append = TRUE)
  cat("Se evalua el algoritmo: ", Algoritmo, "\n", file = archivo.avance, append = TRUE)
  cat("Usando el metodo de muestreo: ", metodo.muestreo, "\n", file = archivo.avance, append = TRUE)
  cat("\n\n", file = archivo.avance, append = TRUE)

  Algoritmo.makeLearner<-makeLearner(cl = Algoritmo)

  if(paralelizacion == TRUE){

    parallelStartSocket(cores)
  }

  result<-try(resultado<-resample(learner = Algoritmo.makeLearner, task = tarea, resampling = muestreo), silent = TRUE)

  if(paralelizacion == TRUE){

    parallelStop()
  }

  archivo.salida<-paste0(constante.inicio.archivo.salida,
         "_",
         Algoritmo,
         "_",
         metodo.muestreo,
         "_Normalizacion_",
         normalizacion,
         ".csv")

  # Si el archivo de salida existe se borra
  unlink(archivo.salida)

  if(class(result) != "try-error"){

    matrix.confusion<-calculateConfusionMatrix(resultado$pred)
    matrix.confusion<-matrix.confusion$result

    acc.performace<-performance(resultado$pred, measures = list(acc))

    data.resultados<-resultado$pred$data
    data.resultados$id<-as.character(data.resultados$id)
    data.resultados$truth<-as.character(data.resultados$truth)
    data.resultados$response<-as.character(data.resultados$response)
    data.resultados$iter<-as.character(data.resultados$iter)
    data.resultados$set<-as.character(data.resultados$set)

    cat("\n",Algoritmo, "\n")
    cat("Validacion: ", metodo.muestreo, "\n\n")
    cat("\tpredicted\n")
    cat("true\t", colnames(matrix.confusion), "\n")
    for(i in 1:(nrow(matrix.confusion) - 1)){

      cat(colnames(matrix.confusion)[i], "\t", paste(as.character(matrix.confusion[i,]), sep = "\t"), "\n")
    }
    cat("\n\n")
    cat("acc: ", acc.performace, "\n\n")

    # Se guardan los resultados

    cat(Algoritmo, "\n\n",file = archivo.salida, append = TRUE)
    cat("Validacion: ", metodo.muestreo, "\n\n", file = archivo.salida, append = TRUE)
    cat("\tpredicted\n", file = archivo.salida, append = TRUE)
    cat("true", colnames(matrix.confusion), "\n", file = archivo.salida, append = TRUE)
    for(i in 1:(nrow(matrix.confusion) - 1)){

      cat(colnames(matrix.confusion)[i], "\t", paste(as.character(matrix.confusion[i,]), sep = "\t"), "\n", file = archivo.salida, append = TRUE)
    }
    cat("\n\n",file = archivo.salida, append = TRUE)
    cat("acc: ", acc.performace, "\n\n", file = archivo.salida, append = TRUE)
    cat(names(resultado$pred$data), "\n", file = archivo.salida, append = TRUE)


    for(i in 1:nrow(data.resultados)){

      cat(paste(as.character(data.resultados[i,]), "\t"), "\n", file = archivo.salida, append = TRUE)

    }


    # Se guardan los resultados en resumen

    cat(Algoritmo, "\n\n",file = archivo.resumen, append = TRUE)
    cat("Validacion: ", metodo.muestreo, "\n\n", file = archivo.resumen, append = TRUE)
    cat("\tpredicted\n", file = archivo.resumen, append = TRUE)
    cat("true", colnames(matrix.confusion), "\n", file = archivo.resumen, append = TRUE)
    for(i in 1:(nrow(matrix.confusion) - 1)){

      cat(colnames(matrix.confusion)[i], "\t", paste(as.character(matrix.confusion[i,]), sep = "\t"), "\n", file = archivo.resumen, append = TRUE)
    }

    cat("\n\n",file = archivo.resumen, append = TRUE)
    cat("acc: ", acc.performace, "\n\n", file = archivo.resumen, append = TRUE)
    cat("------------------------------------------------\n\n", file = archivo.resumen, append = TRUE)

    tiempo<-paste(round((proc.time()-t)[3], digits = 1), "seg")
    cat("A los ", tiempo, "\n", file = archivo.avance, append = TRUE)
    cat("Termina evaluacion de algoritmo: ", Algoritmo, "\n", file = archivo.avance, append = TRUE)
    cat("Usando el metodo de muestreo: ", metodo.muestreo, "\n", file = archivo.avance, append = TRUE)
    cat("------------------------------------------------\n\n", file = archivo.avance, append = TRUE)

  }else{

    tiempo<-paste(round((proc.time()-t)[3], digits = 1), "seg")
    cat("A los ", tiempo, "\n", file = archivo.avance, append = TRUE)
    cat("Termina la evaluacion del algoritmo ",Algoritmo," con error\n", file = archivo.avance, append = TRUE)
    cat("------------------------------------------------\n\n", file = archivo.avance, append = TRUE)

  }
}
