// Variabel untuk versi Node.js
variable "NODE_VERSION" {
  default = "18"
}

// Variabel untuk environment
variable "NODE_ENV" {
  default = "development"
}

// Group default akan membangun semua target
group "default" {
  targets = ["app", "builder", "test"]
}

// Group development untuk pengembangan lokal
group "development" {
  targets = ["app"]
}

// Group production untuk build produksi
group "production" {
  targets = ["builder"]
}

// Target untuk development app
target "app" {
  context = "."
  dockerfile = "Dockerfile"
  target = "dev"
  tags = ["maguru-app:dev"]
  args = {
    NODE_VERSION = "${NODE_VERSION}"
    NODE_ENV = "development"
  }
  cache-from = ["type=registry,ref=maguru-app:dev-cache"]
  cache-to = ["type=registry,ref=maguru-app:dev-cache,mode=max"]
  output = ["type=docker"]
  platforms = ["linux/amd64"]
}

// Target untuk builder production
target "builder" {
  context = "."
  dockerfile = "Dockerfile.build"
  tags = ["maguru-app:prod"]
  args = {
    NODE_VERSION = "${NODE_VERSION}"
    NODE_ENV = "production"
  }
  cache-from = ["type=registry,ref=maguru-app:prod-cache"]
  cache-to = ["type=registry,ref=maguru-app:prod-cache,mode=max"]
  output = ["type=docker"]
  platforms = ["linux/amd64"]
}

// Target untuk test
target "test" {
  context = "."
  dockerfile = "Dockerfile.test"
  tags = ["maguru-app:test"]
  args = {
    NODE_ENV = "test"
    USE_BABEL = "true"
  }
  cache-from = ["type=registry,ref=maguru-app:test-cache"]
  cache-to = ["type=registry,ref=maguru-app:test-cache,mode=max"]
  output = ["type=docker"]
  platforms = ["linux/amd64"]
} 