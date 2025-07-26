# Infrastructure as Code - should be tagged as "Infrastructure as Code"
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Cloud Services - should be tagged as "Cloud Service"
resource "aws_instance" "web_server" {
  ami           = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"
  
  # Purpose Tags - should be tagged as "Resource Purpose"
  purpose = "web_server_production"
  expiry = "2024-12-31"
  owner = "platform_team"
  
  tags = {
    Name        = "WebServer"
    Environment = "production"
    # Resource Purpose
    purpose = "api_gateway"
    # Resource Expiry  
    expiry = "30_days"
    # Resource Owner
    owner = "backend_team"
  }
}

# Storage Operations - should be tagged as "Storage Operation"
resource "aws_s3_bucket" "data_lake" {
  bucket = "company-data-lake"
  
  # Storage Operation
  versioning {
    enabled = true
  }
  
  # Storage Operation
  lifecycle_rule {
    enabled = true
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    # Storage Operation
    expiration {
      days = 365
    }
  }
}

# Compute Resources - should be tagged as "Compute Resource"
resource "aws_autoscaling_group" "web_asg" {
  name                = "web-asg"
  vpc_zone_identifier = [aws_subnet.public.id]
  target_group_arns   = [aws_lb_target_group.web.arn]
  
  # Compute Resource
  min_size         = 2
  max_size         = 10
  desired_capacity = 4
  
  # Compute Resource
  instance_type = "t3.medium"
  
  # Resource Lifecycle
  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }
  
  # Cost Management - should be tagged as "Cost Management"
  mixed_instances_policy {
    instances_distribution {
      # Cost Management
      spot_allocation_strategy = "diversified"
      spot_instance_pools      = 2
      # Cost Management  
      spot_max_price          = "0.05"
    }
  }
}

# ML Infrastructure - should be tagged as "ML Infrastructure"
resource "aws_sagemaker_notebook_instance" "ml_notebook" {
  name          = "ml-training-notebook"
  # ML Infrastructure
  instance_type = "ml.t3.medium"
  role_arn      = aws_iam_role.sagemaker.arn
  
  tags = {
    # Resource Purpose
    purpose = "model_training"
    # Resource Expiry
    expiry = "7_days"
    # Resource Owner
    owner = "ml_team"
  }
}

# Security/Compliance - should be tagged as "Security/Compliance"
resource "aws_security_group" "web_sg" {
  name_prefix = "web-sg"
  vpc_id      = aws_vpc.main.id
  
  # Security/Compliance
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Security/Compliance
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Observability - should be tagged as "Observability"
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "main-dashboard"
  
  # Observability
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        # Observability
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.web_server.id],
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.web.arn_suffix]
          ]
          period = 300
          stat   = "Average"
          region = "us-west-2"
          title  = "EC2 Instance CPU"
        }
      }
    ]
  })
}