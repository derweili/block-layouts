#!/usr/bin/env bash
echo "Starting Deployment"

# 1. Clone complete SVN repository to separate directory
echo "Cloning SVN repository"
echo $SVN_REPOSITORY
svn co $SVN_REPOSITORY ../svn
echo "Clonging successfull"

# 2. Copy git repository contents to SNV trunk/ directory
echo "Copy git repository contents to SNV trunk/ directory"
cp -R ./* ../svn/trunk/
echo "Copy successfull"

# 3. Switch to SVN repository
echo "Switch to SVN repository"
cd ../svn/trunk/
echo "Switch successfull"

# 4. Move plugin-assets/ to SVN /assets/
echo "Move plugin-assets/ to SVN /assets/"
mv ./plugin-assets/ ../assets/
echo "Moving files successfull"

# 5. Clean up unnecessary files
echo "Clean up unnecessary files"
rm -rf .git/
rm -rf deploy/
rm .travis.yml
echo "Clean up successfull"

# 6. Go to SVN repository root
cd ../

# 7. Create SVN tag
echo "Create SVN Tag"
svn cp trunk tags/$TRAVIS_TAG
echo "Tag created"

svn add trunk/*
svn add assets/*
svn add tags/$TRAVIS_TAG/*


# 8. Push SVN tag
echo "Push svn tag"
svn ci  --message "Release $TRAVIS_TAG" \
        --username $SVN_USERNAME \
        --password $SVN_PASSWORD \
        --non-interactive
echo "Push Successfull"