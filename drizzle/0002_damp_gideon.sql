CREATE TABLE `dojoMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`speaker` enum('user','ai') NOT NULL,
	`message` text NOT NULL,
	`audioUrl` varchar(512),
	`score` int NOT NULL DEFAULT 0,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dojoMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dojoPracticeSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scenario` varchar(255) NOT NULL,
	`description` text,
	`score` int NOT NULL DEFAULT 0,
	`status` enum('in_progress','completed') NOT NULL DEFAULT 'in_progress',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dojoPracticeSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sandboxConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`personality` enum('supportive_friend','wise_mentor','patient_teacher','devils_advocate','motivational_coach','calm_therapist') NOT NULL,
	`title` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sandboxConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sandboxMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`speaker` enum('user','ai') NOT NULL,
	`message` text NOT NULL,
	`audioUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sandboxMessages_id` PRIMARY KEY(`id`)
);
