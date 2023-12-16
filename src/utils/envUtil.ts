import type { Client, Guild, Role } from "discord.js";

// #region Getters

/**
 * Returns the home server
 * Will throw errors if misconfigured
 *
 * @param bot
 * @returns
 */
export function getHomeServer(
    bot: Client,
    forceFetch?: boolean
): Promise<Guild> {
    // Check the environment variable has been set
    const homeServerGuildID = process.env.HOME_SERVER_ID;
    if (!homeServerGuildID) {
        throw new Error(
            "Environment: You must configure your `HOME_SERVR_ID` environment variable"
        );
    }

    // Get guild the guild
    return bot.guilds
        .fetch({ guild: homeServerGuildID, force: forceFetch })
        .catch((err) => {
            if (err.message === "Unknown Guild") {
                throw new Error(
                    "Environment: Configured `HOME_SERVER_ID` is invalid or the bot is not within the server"
                );
            }
            throw err;
        });
}

/**
 * Returns the home server manager role
 * Will throw errors if misconfigured
 *
 * @param bot
 * @returns
 */
export async function getManagerRole(
    bot: Client,
    forceFetch?: boolean
): Promise<Role> {
    // Get the home server
    const homeServer = await getHomeServer(bot, true);

    // Check the environment variable has been set
    const managerRoleID = process.env.MANAGER_ROLE_ID;
    if (!managerRoleID) {
        throw new Error(
            "Environment: You must configure your `MANAGER_ROLE_ID` environment variable"
        );
    }

    // Function that will handle the error since it can occur two different ways
    const notFound = () => {
        return new Error(
            "Environment: Configured `MANAGER_ROLE_ID` is invalid"
        );
    };
    // Get the role from the home server
    const managerRole = await homeServer.roles
        .fetch(managerRoleID, { force: forceFetch })
        .catch((err) => {
            if (err.message === "Unknown Role") {
                throw notFound();
            }
            throw err;
        });

    // Double check the fetch returned the role
    if (!managerRole) {
        throw notFound();
    }

    return managerRole;
}

/**
 * Returns the home server staff role
 * Will throw errors if misconfigured
 *
 * @param bot
 * @returns
 */
export async function getStaffRole(
    bot: Client,
    forceFetch?: boolean
): Promise<Role> {
    // Get the home server
    const homeServer = await getHomeServer(bot, true);

    // Check the environment variable has been set
    const staffRoleID = process.env.STAFF_ROLE_ID;
    if (!staffRoleID) {
        throw new Error(
            "Environment: You must configure your `STAFF_ROLE_ID` environment variable"
        );
    }

    // Function that will handle the error since it can occur two different ways
    const notFound = () => {
        return new Error("Environment: Configured `STAFF_ROLE_ID` is invalid");
    };
    // Get the role from the home server
    const staffRole = await homeServer.roles
        .fetch(staffRoleID, { force: forceFetch })
        .catch((err) => {
            if (err.message === "Unknown Role") {
                throw notFound();
            }
            throw err;
        });

    // Double check the fetch returned the role
    if (!staffRole) {
        throw notFound();
    }

    return staffRole;
}

// #endregion Getters

// #region Checkers

/**
 * Will determine if the provided user has the manager role
 *
 * @param bot
 * @param userID The user ID to check
 * @param forceFetch If we should force an update of the cache
 * @returns
 */
export async function isUserManager(
    bot: Client,
    userID: string,
    forceFetch?: boolean
): Promise<boolean> {
    const managerRole = await getManagerRole(bot, forceFetch);
    return !!managerRole.members.get(userID);
}

/**
 * Will determine if the provided user has the staff or manager role
 *
 * @param bot
 * @param userID The user ID to check
 * @param forceFetch If we should force an update of the cache
 * @returns
 */
export async function isUserStaff(
    bot: Client,
    userID: string,
    forceFetch?: boolean
): Promise<boolean> {
    const staffRole = await getStaffRole(bot, forceFetch);
    return !!staffRole.members.get(userID) || isUserManager(bot, userID);
}

// #endregion
