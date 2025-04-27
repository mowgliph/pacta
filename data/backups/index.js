// Directorio de Copias de Seguridad de PACTA
// =====================================
//
// Este directorio contiene las copias de seguridad automáticas de la base de datos
// y otros archivos críticos del sistema PACTA.
//
// Políticas de Retención:
// - Se mantienen los backups de los últimos 7 días
// - Los backups más antiguos se eliminan automáticamente
// - Se realiza un backup automático cada 24 horas
//
// Formato de nombre de archivo:
// backup_YYYY-MM-DDTHH-mm-ss.sssZ.sqlite
//
// NO MODIFICAR O ELIMINAR MANUALMENTE LOS ARCHIVOS EN ESTE DIRECTORIO
// Los backups son gestionados automáticamente por el sistema
