# NANOBOX: for some reason when running in production Rails will precomiple the
# assets with the digest key, but not fetch using the /assets path
if Rails.env.production? && !ENV['PRECOMPILE']
  Rails.application.config.assets.paths = []
end
