import sqlite3

# Path to your SQLite database
DB_PATH = "db.sqlite3"

sql_script = """
INSERT INTO "courses_account" VALUES (1,'admin','pbkdf2_sha256$1200000$afJGICJeKy8Jh42U6KlTSn$RT8qIY3ixXaNUBSFSTZ/CJxi22/7hDRtokif+eqDvzQ=','admin@admin.com',1,'2026-04-23 05:44:22.663584');
INSERT INTO "courses_account" VALUES (2,'user','pbkdf2_sha256$1200000$s3SagCsxTezuiw1P5Ctcuk$pHhQDVil/e5KXFcKKue9hwGIzOy0rMZ/FqpxGvAbrL4=','user@user.com',0,'2026-04-23 05:47:52.107337');

INSERT INTO "courses_product" VALUES (1,'Tokyo Neon Box','A premium mystery box filled with rare Japanese snacks and treats straight from the streets of Tokyo.',89.99,15,'Japan','2026-03-21 17:26:37.608167','https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800');
INSERT INTO "courses_product" VALUES (2,'Taste of Italy Box','Discover authentic Italian flavours with a curated selection of pastas, sauces and artisanal sweets.',39.99,30,'Italy','2026-03-21 17:26:37.620098','https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800');
INSERT INTO "courses_product" VALUES (3,'Swiss Alps Chocolate Box','Indulge in a handpicked selection of the finest handcrafted Swiss chocolates.',65.00,40,'Switzerland','2026-03-21 17:26:37.628440','https://images.unsplash.com/photo-1542840410-3092f99611a3?w=800');
INSERT INTO "courses_product" VALUES (4,'Mexican Fiesta Box','A vibrant mix of authentic Mexican snacks, hot sauces and traditional sweets.',34.99,45,'Mexico','2026-03-21 17:26:37.639638','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800');
INSERT INTO "courses_product" VALUES (5,'Nordic Adventure Box','A cosy collection of Scandinavian snacks and treats inspired by the Norwegian wilderness.',55.00,20,'Norway','2026-03-21 17:26:37.647858','https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800');
INSERT INTO "courses_product" VALUES (6,'Greek Carepackage','Product of Greece',10.49,10,'Greece','2026-04-23 06:22:45.387510','https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Frare-gallery.com%2Fuploads%2Fposts%2F508533-architecture.jpg&f=1&nofb=1&ipt=c5eded7a4f3f67d9bf287bf30f825fd538029d61103b03e843bce86e63b5c357');
INSERT INTO "courses_product" VALUES (7,'The Essence of China','Experience some of the culture of China',59.99,30,'China','2026-04-23 06:28:39.586579','https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fs3.ams.com.kh%2Feconomy%2F2023%2F01%2FChineseNewYear-isapproaching-768x512.jpg&f=1&nofb=1&ipt=fec57b25b0d7fb9c77386b26cbdc9cacdf2c5bf392541bcd00ab2575027cf9b4');
INSERT INTO "courses_product" VALUES (8,'Brazilian Nights','Brazilian magic brought to your home',39.99,35,'Brazil','2026-04-23 06:32:21.785714','https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapers.com%2Fimages%2Ffeatured%2Fbrazil-b4dydodrhw6tw1ya.jpg&f=1&nofb=1&ipt=68d079197ab4e8b43a0eadeb132de7f81df573c0db4a1922e79782c3bcd93b3a');

INSERT INTO "courses_cart" VALUES (1,'active','2026-05-23 06:01:03.733562',2);
INSERT INTO "courses_cart" VALUES (2,'active','2026-05-23 06:10:04.699705',1);

INSERT INTO "courses_cartitem" VALUES (3,1,2,2);
INSERT INTO "courses_cartitem" VALUES (4,1,2,3);

INSERT INTO "courses_session" VALUES (1,'9c35eb796384499c26d16c3ba897d1ec8888332dff91327063d913d0a2df05df','2026-04-24 06:26:24.012219',2);
INSERT INTO "courses_session" VALUES (2,'b3d39bd9a9f8df48e6397a68af3f0c93c8042a0c08687b19831c4ed72aaaa931','2026-04-24 10:33:24.665351',2);

INSERT INTO "courses_address" VALUES (1,'+47 88888888','Grøholtvegen 2','','Tromsø','Troms','9010','Norway',2);
INSERT INTO "courses_address" VALUES (2,'+47 88888888','Langsundvegen 25','','Tromsø','Troms','9010','Norway',2);
"""

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Execute all INSERT statements
    cursor.executescript(sql_script)

    conn.commit()
    print("Data inserted successfully.")

except sqlite3.Error as thrown:
    print(f"SQLite error: {thrown}")

finally:
    if conn:
        conn.close()