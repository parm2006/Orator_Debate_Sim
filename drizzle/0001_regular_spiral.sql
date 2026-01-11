CREATE TABLE `debateMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`debateId` int NOT NULL,
	`speaker` enum('pro','con','user') NOT NULL,
	`message` text NOT NULL,
	`audioUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debateMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` text NOT NULL,
	`status` enum('active','paused','completed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `debates_id` PRIMARY KEY(`id`)
);
