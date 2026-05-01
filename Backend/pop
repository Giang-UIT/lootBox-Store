BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "courses_department" (
	"id"	integer NOT NULL,
	"name"	varchar(100) NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "courses_course" (
	"id"	integer NOT NULL,
	"title"	varchar(100) NOT NULL,
	"dept_id"	bigint NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("dept_id") REFERENCES "courses_department"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "courses_account" (
	"id"	integer NOT NULL,
	"name"	varchar(100) NOT NULL,
	"password"	varchar(100) NOT NULL,
	"email"	varchar(100) NOT NULL UNIQUE,
	"admin_status"	bool NOT NULL,
	"time_created"	datetime NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "courses_product" (
	"id"	integer NOT NULL,
	"name"	varchar(100) NOT NULL,
	"description"	text NOT NULL,
	"price"	decimal NOT NULL,
	"stock_quantity"	integer unsigned NOT NULL CHECK("stock_quantity" >= 0),
	"origin_country"	varchar(100) NOT NULL,
	"time_created"	datetime NOT NULL,
	"image"	varchar(200) NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "courses_cart" (
	"id"	integer NOT NULL,
	"status"	varchar(20) NOT NULL,
	"time_created"	datetime NOT NULL,
	"account_id"	bigint NOT NULL,
	FOREIGN KEY("account_id") REFERENCES "courses_account"("id") DEFERRABLE INITIALLY DEFERRED,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "courses_cartitem" (
	"id"	integer NOT NULL,
	"item_quantity"	integer unsigned NOT NULL CHECK("item_quantity" >= 0),
	"cart_id"	bigint NOT NULL,
	"product_id"	bigint NOT NULL,
	FOREIGN KEY("product_id") REFERENCES "courses_product"("id") DEFERRABLE INITIALLY DEFERRED,
	FOREIGN KEY("cart_id") REFERENCES "courses_cart"("id") DEFERRABLE INITIALLY DEFERRED,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "courses_session" (
	"id"	integer NOT NULL,
	"token"	varchar(64) NOT NULL UNIQUE,
	"expires_at"	datetime NOT NULL,
	"account_id"	bigint NOT NULL,
	FOREIGN KEY("account_id") REFERENCES "courses_account"("id") DEFERRABLE INITIALLY DEFERRED,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "courses_address" (
	"id"	integer NOT NULL,
	"phone_number"	varchar(20) NOT NULL,
	"line1"	varchar(255) NOT NULL,
	"line2"	varchar(255) NOT NULL,
	"city"	varchar(100) NOT NULL,
	"state"	varchar(100) NOT NULL,
	"postal_code"	varchar(20) NOT NULL,
	"country"	varchar(100) NOT NULL,
	"account_id"	bigint NOT NULL,
	FOREIGN KEY("account_id") REFERENCES "courses_account"("id") DEFERRABLE INITIALLY DEFERRED,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO "courses_account" VALUES (2,'admin','pbkdf2_sha256$1200000$afJGICJeKy8Jh42U6KlTSn$RT8qIY3ixXaNUBSFSTZ/CJxi22/7hDRtokif+eqDvzQ=','admin@admin.com',1,'2026-04-23 05:44:22.663584');
INSERT INTO "courses_account" VALUES (3,'user','pbkdf2_sha256$1200000$s3SagCsxTezuiw1P5Ctcuk$pHhQDVil/e5KXFcKKue9hwGIzOy0rMZ/FqpxGvAbrL4=','user@user.com',0,'2026-04-23 05:47:52.107337');
INSERT INTO "courses_product" VALUES (1,'Tokyo Neon Box','Caja premium con accesorios de Tokio y snacks raros.',89.99,15,'Japan','2026-03-21 17:26:37.608167','https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800');
INSERT INTO "courses_product" VALUES (2,'Taste of Italy Box','Pastas italianas auténticas, salsas y postres artesanales.',39.99,30,'Italy','2026-03-21 17:26:37.620098','https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800');
INSERT INTO "courses_product" VALUES (3,'Swiss Alps Chocolate','Los mejores chocolates suizos hechos a mano.',65,40,'Switzerland','2026-03-21 17:26:37.628440','https://images.unsplash.com/photo-1542840410-3092f99611a3?w=800');
INSERT INTO "courses_product" VALUES (4,'Mexican Fiesta Box','Dulces mexicanos auténticos, salsas picantes y artesanías.',34.99,45,'Mexico','2026-03-21 17:26:37.639638','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800');
INSERT INTO "courses_product" VALUES (5,'Nordic Adventure','Regalos escandinavos premium y accesorios acogedores.',55,20,'Norway','2026-03-21 17:26:37.647858','https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fres.cloudinary.com%2Ffjordtours%2Fimage%2Fupload%2Fw_auto%2Fdpr_auto%2Fc_fill%2Ff_auto%2Fq_auto%2Fc_limit%2Cw_3840%2Fv1%2Fnorway%2Fthings-to-do%2Ffjord-cruise%2Frib-boat-tours%2Fhardangerfjord-and-fyksesund-rib-safari%2Ffast-driving%3F_a%3DBAVAZGB00&f=1&nofb=1&ipt=cc7d0f5d374bf25002a01dc5bdfea2a74c5eefb0b555a3ac7a54e90ed7b6247c');
INSERT INTO "courses_product" VALUES (6,'Greek Carepackage','Product of Greece',10.49,10,'Greece','2026-04-23 06:22:45.387510','https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Frare-gallery.com%2Fuploads%2Fposts%2F508533-architecture.jpg&f=1&nofb=1&ipt=c5eded7a4f3f67d9bf287bf30f825fd538029d61103b03e843bce86e63b5c357');
INSERT INTO "courses_product" VALUES (7,'The Essence of China','Experience some of the culture of China',59.99,30,'China','2026-04-23 06:28:39.586579','https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fs3.ams.com.kh%2Feconomy%2F2023%2F01%2FChineseNewYear-isapproaching-768x512.jpg&f=1&nofb=1&ipt=fec57b25b0d7fb9c77386b26cbdc9cacdf2c5bf392541bcd00ab2575027cf9b4');
INSERT INTO "courses_product" VALUES (8,'Brazilian Nights','Brazilian magic brought to your home',39.99,35,'Brazil','2026-04-23 06:32:21.785714','https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapers.com%2Fimages%2Ffeatured%2Fbrazil-b4dydodrhw6tw1ya.jpg&f=1&nofb=1&ipt=68d079197ab4e8b43a0eadeb132de7f81df573c0db4a1922e79782c3bcd93b3a');
INSERT INTO "courses_cart" VALUES (2,'active','2026-04-23 06:01:03.733562',3);
INSERT INTO "courses_cart" VALUES (3,'active','2026-04-23 06:10:04.699705',2);
INSERT INTO "courses_cartitem" VALUES (3,1,2,2);
INSERT INTO "courses_cartitem" VALUES (4,1,2,3);
INSERT INTO "courses_session" VALUES (5,'9c35eb796384499c26d16c3ba897d1ec8888332dff91327063d913d0a2df05df','2026-04-24 06:26:24.012219',2);
INSERT INTO "courses_session" VALUES (6,'b3d39bd9a9f8df48e6397a68af3f0c93c8042a0c08687b19831c4ed72aaaa931','2026-04-24 10:33:24.665351',2);
INSERT INTO "courses_address" VALUES (1,'+47 88888888','Grøholtvegen 2','','Tromsø','Troms','9010','Norway',3);
INSERT INTO "courses_address" VALUES (2,'+47 88888888','Langsundvegen 25','','Tromsø','Troms','9010','Norway',3);
CREATE INDEX IF NOT EXISTS "courses_course_dept_id_6ff3ec18" ON "courses_course" (
	"dept_id"
);
CREATE INDEX IF NOT EXISTS "courses_cart_account_id_9422186e" ON "courses_cart" (
	"account_id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "courses_cartitem_cart_id_product_id_bd518916_uniq" ON "courses_cartitem" (
	"cart_id",
	"product_id"
);
CREATE INDEX IF NOT EXISTS "courses_cartitem_cart_id_e80a9d82" ON "courses_cartitem" (
	"cart_id"
);
CREATE INDEX IF NOT EXISTS "courses_cartitem_product_id_4f0a29a6" ON "courses_cartitem" (
	"product_id"
);
CREATE INDEX IF NOT EXISTS "courses_session_account_id_d7c1ca85" ON "courses_session" (
	"account_id"
);
CREATE INDEX IF NOT EXISTS "courses_address_account_id_8cf79f3c" ON "courses_address" (
	"account_id"
);
COMMIT;
