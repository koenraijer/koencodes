import { writable } from "svelte/store";

export const seo = writable({
title: "koen.wtf · noob tech hub", // default title
description: "a personal online hub written in SvelteKit where I practice programming, write about tech and describe my projects." // default description
})