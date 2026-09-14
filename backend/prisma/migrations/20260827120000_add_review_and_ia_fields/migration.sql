-- Este archivo es "código SQL": son las órdenes exactas que se le mandan a
-- Postgres para modificar la base de datos real. Prisma genera uno de estos
-- automáticamente cada vez que cambiás schema.prisma y corrés
-- "npx prisma migrate dev". Una vez aplicado, NUNCA se edita a mano — si hay
-- que corregir algo, se hace otra migración nueva.

-- Le agrega a la tabla "user" (ya existente) una columna nueva "likes", que
-- guarda una lista de textos (los gustos/preferencias del dueño del perro).
-- DEFAULT ARRAY[]::TEXT[] = si no se especifica nada, empieza como lista vacía.
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "likes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Le agrega a la tabla "walker" (ya existente) 3 columnas nuevas:
-- "tags" (especialidades, lista de textos) y "latitude"/"longitude"
-- (ubicación del paseador, para el matching por cercanía).
-- AlterTable
ALTER TABLE "walker" ADD COLUMN     "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- Tabla nueva: una fila por cada franja horaria en la que un paseador está
-- disponible (ej. de 8:00 a 12:00 serían los minutos 480 a 720).
-- CreateTable
CREATE TABLE "walker_availability" (
    "id" SERIAL NOT NULL,
    "walker_id" INTEGER NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,

    CONSTRAINT "walker_availability_pkey" PRIMARY KEY ("id")
);

-- Tabla nueva: una fila por cada reseña que un usuario deja sobre un paseo
-- ya finalizado.
-- CreateTable
CREATE TABLE "review" (
    "id" SERIAL NOT NULL,
    "walk_id" INTEGER NOT NULL,
    "walker_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- Un índice "único" es una regla que la base de datos hace cumplir sola:
-- acá dice "no puede haber dos filas de review con el mismo walk_id", o sea,
-- un paseo no puede tener más de una reseña.
-- CreateIndex
CREATE UNIQUE INDEX "review_walk_id_key" ON "review"("walk_id");

-- Las líneas de acá abajo (FOREIGN KEY) son las que conectan las tablas
-- entre sí: le dicen a Postgres "walker_id en esta tabla tiene que
-- corresponder a un id real en la tabla walker", y "si se borra ese
-- walker/walk/user, borrá en cascada también estas filas relacionadas"
-- (ON DELETE CASCADE).
-- AddForeignKey
ALTER TABLE "walker_availability" ADD CONSTRAINT "walker_availability_walker_id_fkey" FOREIGN KEY ("walker_id") REFERENCES "walker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_walk_id_fkey" FOREIGN KEY ("walk_id") REFERENCES "walk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_walker_id_fkey" FOREIGN KEY ("walker_id") REFERENCES "walker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
