
# Funcion para normalizar por columnas (dato menos el promedio, dividido esto por la desviacion estandar)

# Parametros:
# set de entrenamiento: data.frame con los ejemplos para entrenar un modelo.
# test: data.frame de ejemplos a testear

# devuelve una lista con el set de entrenamiento y el test normalizados
# Acceda a datos_normalizados[[1]] para set de  entrenamiento
# Acceda a datos_normalizados[[2]] para promedios de las columnas
# Acceda a datos_normalizados[[3]] para desviacion estandar de las columnas

normalizacion_por_columnas<-function(set_entrenamiento){

  bandera<-TRUE
  
  #Se obtienen los promedios y desviaciones estandar por vector
  for(i in 1:ncol(set_entrenamiento)){
    
    if(colnames(set_entrenamiento)[i] != nombre.target){
      
      mean<-mean(set_entrenamiento[,i])
      sd<-sd(set_entrenamiento[,i])
      
      set_entrenamiento[,i]<-(set_entrenamiento[,i] - mean) / sd
      
      if(bandera == TRUE){
        
        mean_vector<-mean
        sd_vector<-sd
        
        bandera<-FALSE
        
      }else{
        
        mean_vector<-c(mean_vector, mean)
        sd_vector<-c(sd_vector, sd)
      }
    }
  }
    
  return(list(set_entrenamiento, mean_vector, sd_vector))
}