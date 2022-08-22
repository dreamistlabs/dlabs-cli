const { DateTime } = require('luxon');

module.exports = function (UI) {
  UI.registerHelper('formatDate', (datetime, format = 'short') => {
    if (format === 'long') {
      return DateTime.fromISO(datetime).toLocaleString(DateTime.DATE_HUGE);
    } else {
      const { day, month, year } = DateTime.fromISO(datetime);
      const d = day < 10 ? `0${day}` : day;
      const m = month < 10 ? `0${month}` : month;

      return `${year}-${m}-${d}`;
    }
  });

  // Removes the prefixes in the commit messages (e.g., added, changed, deprecated, etc.)
  UI.registerHelper('getCommitSections', () => {
    const types = ['Added', 'Changed', 'Deprecated', 'Fixed', 'Removed', 'Security', 'Other'];
    const excludes = types
      .slice(0, types.length - 1)
      .map(type => `(${type}: )|(${type.toLowerCase()}: )`)
      .join('|');

    return types.map(type => ({
      sectionHeading: `#### ${type}`,
      msgPrefix: `(${type}: )|(${type.toLowerCase()}: )`,
      exclude: type === 'Other' ? excludes : null,
    }));
  });

  // Removes the prefixes in the commit messages (eg, other, feature, etc)
  UI.registerHelper('removePrefix', subject => {
    const replaceRegex = new RegExp(/^(.+:)/m);

    return subject.replace(replaceRegex, '').trim();
  });

  // Filters releases to exclude pre-V1 commits
  UI.registerHelper('filterPostV1Releases', releases => {
    // Matches Semver formatted versions from v1 and onwards (e.g., v1.x.x, v1.x.x-a.1, v1.x.x-rc.3, etc)
    const postV1Regex = new RegExp(/^v?([0-9][0-9]*)\.(\d*)\.(\d*)[\-(\w)\.\d*]*/);

    return releases.filter(release => release.title.match(postV1Regex));
  });
};
