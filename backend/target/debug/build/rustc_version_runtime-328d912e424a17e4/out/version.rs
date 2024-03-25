
            /// Returns the `rustc` SemVer version and additional metadata
            /// like the git short hash and build date.
            pub fn version_meta() -> VersionMeta {
                VersionMeta {
                    semver: Version {
                        major: 1,
                        minor: 77,
                        patch: 0,
                        pre: vec![],
                        build: vec![],
                    },
                    host: "aarch64-apple-darwin".to_owned(),
                    short_version_string: "rustc 1.77.0 (aedd173a2 2024-03-17)".to_owned(),
                    commit_hash: Some("aedd173a2c086e558c2b66d3743b344f977621a7".to_owned()),
                    commit_date: Some("2024-03-17".to_owned()),
                    build_date: None,
                    channel: Channel::Stable,
                }
            }
            