import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  check,
  json,
  foreignKey,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const todos = pgTable(
  "todos",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: varchar({ length: 500 }).notNull(),
    description: varchar({ length: 1000 }),
    completed: boolean().notNull().default(false),
    tags: json("tags").$type<string[]>().default([]),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("todos_user_id_idx").on(table.userId),
    index("todos_created_at_idx").on(table.createdAt),
  ]
);

export const tags = pgTable(
  "tags",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: varchar({ length: 100 }).notNull(),
    colorHex: varchar({ length: 7 }).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("tags_name_idx").on(table.name), // Ensure unique tag name
    check("color_hex_length", sql`char_length(${table.colorHex}) = 7`),
  ]
);

// Junction table for many-to-many relationship
export const todosToTags = pgTable(
  "todos_to_tags",
  {
    todoId: uuid("todo_id")
      .notNull()
      .references(() => todos.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.todoId, table.tagId] }),
    index("todos_to_tags_todo_id_idx").on(table.todoId),
    index("todos_to_tags_tag_id_idx").on(table.tagId),
  ]
);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Define relationships
export const todosRelations = relations(todos, ({ one, many }) => ({
  // Each todo belongs to one user
  user: one(user, {
    fields: [todos.userId],
    references: [user.id],
  }),
  // Each todo has many related tag links
  todosToTags: many(todosToTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  todosToTags: many(todosToTags),
}));

export const todosToTagsRelations = relations(todosToTags, ({ one }) => ({
  // Each todosToTag -> one todo
  todo: one(todos, {
    fields: [todosToTags.todoId],
    references: [todos.id],
  }),
  // Each todosToTag -> tag
  tag: one(tags, {
    fields: [todosToTags.tagId],
    references: [tags.id],
  }),
}));

export const usersRelations = relations(user, ({ many }) => ({
  todos: many(todos),
}));
