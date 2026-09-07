CREATE TABLE "commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"amount" numeric(10, 2) DEFAULT 1000 NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"paid_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "commissions_property_id_unique" UNIQUE("property_id")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"address" varchar(300) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip_code" varchar(10) NOT NULL,
	"country" varchar(100) DEFAULT 'United States' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_vendor_terms" boolean DEFAULT false NOT NULL,
	"is_deceased_estate" boolean DEFAULT false NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" numeric(3, 1) NOT NULL,
	"square_feet" integer NOT NULL,
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"image" varchar(500) NOT NULL,
	"caption" varchar(200) DEFAULT '' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(150) NOT NULL,
	"email" varchar(254) NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" varchar(150) DEFAULT '' NOT NULL,
	"last_name" varchar(150) DEFAULT '' NOT NULL,
	"is_vendor" boolean DEFAULT false NOT NULL,
	"is_staff" boolean DEFAULT false NOT NULL,
	"is_superuser" boolean DEFAULT false NOT NULL,
	"phone" varchar(20) DEFAULT '' NOT NULL,
	"company_name" varchar(200) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_vendor_id_users_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");