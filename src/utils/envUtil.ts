import type { Client, Guild, Role } from "discord.js";

// #region Getters

/**
 * Returns the home server
 * Will throw errors if misconfigured
 *
 * @param bot
 * @returns
 */
export async function getHomeServer(
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

    // Get guild from cache
    const homeServerFromCache = bot.guilds.cache.get(homeServerGuildID);

    // Fetch the guild if it's not in the cache
    if (forceFetch || !homeServerFromCache) {
        const homeServerFromFetch = await bot.guilds
            .fetch(homeServerGuildID)
            .catch((err) => {
                if (err.message === "Unknown Guild") {
                    throw new Error(
                        "Environment: Configured `HOME_SERVER_ID` is invalid or the bot is not within the server"
                    );
                }
                throw err;
            });
        return homeServerFromFetch;
    }
    return homeServerFromCache;
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
    const homeServer = await getHomeServer(bot);

    // Check the environment variable has been set
    const managerRoleID = process.env.MANAGER_ROLE_ID;
    if (!managerRoleID) {
        throw new Error(
            "Environment: You must configure your `MANAGER_ROLE_ID` environment variable"
        );
    }

    // Get the role from the cache
    const managerRoleFromCache = homeServer.roles.cache.get(managerRoleID);

    // Fetch the role if it's not in the cache
    if (forceFetch || !managerRoleFromCache) {
        // Function that will handle the error since it can occur two different ways
        const notFound = () => {
            return new Error(
                "Environment: Configured `MANAGER_ROLE_ID` is invalid"
            );
        };

        const managerRoleFromFetch = await homeServer.roles
            .fetch(managerRoleID)
            .catch((err) => {
                if (err.message === "Unknown Role") {
                    throw notFound();
                }
                throw err;
            });
        if (!managerRoleFromFetch) {
            throw notFound();
        }
        return managerRoleFromFetch;
    }
    return managerRoleFromCache;
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
    const homeServer = await getHomeServer(bot);

    // Check the environment variable has been set
    const staffRoleID = process.env.STAFF_ROLE_ID;
    if (!staffRoleID) {
        throw new Error(
            "Environment: You must configure your `STAFF_ROLE_ID` environment variable"
        );
    }

    // Get the role from the cache
    const staffRoleFromCache = homeServer.roles.cache.get(staffRoleID);

    // Fetch the role if it's not in the cache
    if (forceFetch || !staffRoleFromCache) {
        // Function that will handle the error since it can occur two different ways
        const notFound = () => {
            return new Error(
                "Environment: Configured `STAFF_ROLE_ID` is invalid"
            );
        };

        const staffRoleFromFetch = await homeServer.roles
            .fetch(staffRoleID)
            .catch((err) => {
                if (err.message === "Unknown Role") {
                    throw notFound();
                }
                throw err;
            });
        if (!staffRoleFromFetch) {
            throw notFound();
        }
        return staffRoleFromFetch;
    }
    return staffRoleFromCache;
}

// #endregion Getters

// #region Checkers

/**
 * Will determine if the provided user has the manager role
 *
 * @param bot
 * @param userID The user ID to check
 * @returns
 */
export async function isUserManager(
    bot: Client,
    userID: string
): Promise<boolean> {
    // Force fetch so we can updated member cache
    const managerRole = await getManagerRole(bot, true);
    return !!managerRole.members.get(userID);
}

/**
 * Will determine if the provided user has the staff or manager role
 *
 * @param bot
 * @param userID The user ID to check
 * @returns
 */
export async function isUserStaff(
    bot: Client,
    userID: string
): Promise<boolean> {
    // Force fetch so we can updated member cache
    const staffRole = await getStaffRole(bot, true);
    return !!staffRole.members.get(userID) || isUserManager(bot, userID);
}

// #endregion
